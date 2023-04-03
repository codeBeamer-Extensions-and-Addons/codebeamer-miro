import React, { useState } from "react";
import { createConnectorsForDownstreamRefsAndAssociation } from "../../../../../api/miro.api";
import getAppCardIds from "../../../../../api/utils/getAppCardIds";
import { useItemRelations } from "../../../../../hooks/useItemRelations";
import doAllConnectorsExist from "../../../../../api/utils/doAllConnectorsExist";
import removeConnectors from "../../../../../api/utils/removeConnectors";
import { BoardNode } from "@mirohq/websdk-types";

interface Association {
  associationId: number;
  targetItemId: number;
}

export default function LoadRelationsButton(props: {
  itemId: string | number;
  cardId: string | number;
}) {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [downstreamRefs, setDownstreamRefs] = useState<number[]>([]);
  const [relationsOnBoardCount, setRelationsOnBoardCount] = useState(0);
  const [relationsLoading, setRelationsLoading] = useState(true);
  const [connectorsAlreadyExist, setConnectorsAlreadyExist] = useState(false);
  const [miroBoardData, setMiroBoardData] = useState<BoardNode[]>([]);
  const [miroMetadata, setMiroMetadata] = useState<[]>([]);

  const { relations: data, error, isLoading } = useItemRelations(props.itemId);

  // get all downstreamRefs and associations and then call in the miro.api a method which creates all connectors
  React.useEffect(() => {
    async function fetchData() {
      if (
        data &&
        (data.downstreamReferences.length || data.outgoingAssociations.length)
      ) {
        const boardData = await miro.board.get();
        const metadata = await getMiroMetadata(boardData);

        const downstreamRefs: React.SetStateAction<number[]> = [];
        const associations: Association[] = [];
        if (data.downstreamReferences.length) {
          data.downstreamReferences.forEach(function (downstreamReference) {
            downstreamRefs.push(downstreamReference.itemRevision.id);
          });
        }
        if (data.outgoingAssociations.length) {
          data.outgoingAssociations.forEach(function (outgoingAssociation) {
            const association = {
              associationId: outgoingAssociation.id,
              targetItemId: outgoingAssociation.itemRevision.id,
            };
            associations.push(association);
          });
        }

        //check if connectors already exist on the board
        const connectorsExist = await doAllConnectorsExist(
          props.cardId.toString(),
          downstreamRefs,
          associations,
          boardData,
          metadata
        );

        setConnectorsAlreadyExist(connectorsExist);

        //check if downstreamReferences or outgoingAssociations exist on the board
        const amountOfRelationsOnBoard =
          await calculateAmountOfRelationsOnBoard(metadata);

        setButtonDisabled(amountOfRelationsOnBoard == 0);
        setDownstreamRefs(downstreamRefs);
        setAssociations(associations);
        setMiroBoardData(boardData);
        setMiroMetadata(metadata);
      }
    }

    fetchData();
    setRelationsLoading(false);
  }, [data]);

  const getMiroMetadata = async (boardData: BoardNode[]) => {
    let metadata = [];
    // get metadata for each item on the board
    await Promise.all(
      boardData.map(async (item) => {
        if (item.type == "app_card" || item.type == "connector") {
          const itemMetadata = await miro.board.getMetadata(item);

          const data = {
            cardId: item.id,
            metadata: itemMetadata,
            type: item.type,
          };
          metadata.push(data);
        }
      })
    );
    return metadata;
  };

  const calculateAmountOfRelationsOnBoard = async (metadata: []) => {
    let count = 0;
    await Promise.all(
      data.outgoingAssociations.map(async function (outgoingAssociation) {
        const appCardIds = await getAppCardIds(
          outgoingAssociation.itemRevision.id,
          metadata
        );
        count += appCardIds.length;
      })
    );
    await Promise.all(
      data.downstreamReferences.map(async function (downstreamReference) {
        const appCardIds = await getAppCardIds(
          downstreamReference.itemRevision.id,
          metadata
        );
        count += appCardIds.length;
      })
    );
    setRelationsOnBoardCount(count);
    return count;
  };

  const onClickShow = async () => {
    setRelationsLoading(true);
    const boardData = await miro.board.get();
    const metadata = await getMiroMetadata(boardData);
    if (data && !buttonDisabled) {
      await createConnectorsForDownstreamRefsAndAssociation(
        props.cardId.toString(),
        downstreamRefs,
        associations,
        boardData,
        metadata
      );
    } else {
      console.warn(
        "Can't load Associations - data still loading or failed to do so."
      );
    }

    setConnectorsAlreadyExist(!connectorsAlreadyExist);
    setRelationsLoading(false);
  };

  const onClickHide = async () => {
    setRelationsLoading(true);
    const boardData = await miro.board.get();
    if (data && !buttonDisabled) {
      await removeConnectors(props.cardId.toString(), boardData);
    } else {
      console.warn(
        "Can't load Associations - data still loading or failed to do so."
      );
    }

    setConnectorsAlreadyExist(!connectorsAlreadyExist);
    setRelationsLoading(false);
  };

  return (
    <>
      <button
        className={`button button-tertiary ${
          relationsLoading ? "button-loading button-loading-primary" : ""
        }`}
        onClick={
          connectorsAlreadyExist ? () => onClickHide() : () => onClickShow()
        }
        disabled={buttonDisabled}
        data-test="show-dependency"
        title={
          connectorsAlreadyExist
            ? `Hide Dependency & Associations (${relationsOnBoardCount})`
            : `Show Dependency & Associations (${relationsOnBoardCount})`
        }
      >
        {!relationsLoading && (
          <>
            <span className="icon-arrow-line-shape"></span>
          </>
        )}
      </button>
    </>
  );
}
