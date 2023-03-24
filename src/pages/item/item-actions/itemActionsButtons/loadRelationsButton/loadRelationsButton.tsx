import React, { useState } from "react";
import { createConnectorsForDownstreamRefsAndAssociation } from "../../../../../api/miro.api";
import getAppCardIds from "../../../../../api/utils/getAppCardIds";
import { useItemRelations } from "../../../../../hooks/useItemRelations";
import doAllConnectorsExist from "../../../../../api/utils/doAllConnectorsExist";
import removeConnectors from "../../../../../api/utils/removeConnectors";
import { Board, BoardNode } from "@mirohq/websdk-types";

interface Association {
  associationId: number;
  targetItemId: number;
}

export default function LoadRelationsButton(props: {
  itemId: string | number;
}) {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [downstreamRefs, setDownstreamRefs] = useState<number[]>([]);
  const [relationsOnBoardCount, setRelationsOnBoardCount] = useState(0);
  const [relationsLoading, setRelationsLoading] = useState(true);
  const [connectorsAlreadyExist, setConnectorsAlreadyExist] = useState(false);
  const [miroBoardData, setMiroBoardData] = useState<BoardNode[]>([]);

  const { relations: data, error, isLoading } = useItemRelations(props.itemId);

  // get all downstreamRefs and associations and then call in the miro.api a method which creates all connectors
  React.useEffect(() => {
    async function fetchData() {
      if (
        data &&
        (data.downstreamReferences.length || data.outgoingAssociations.length)
      ) {
        const boardData = await miro.board.get();

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
        const startCardIds = await getAppCardIds(
          parseInt(props.itemId.toString()),
          boardData
        );
        const startCardId = startCardIds[0];
        const connectorsExist = await doAllConnectorsExist(
          startCardId,
          downstreamRefs,
          associations,
          boardData
        );

        setConnectorsAlreadyExist(connectorsExist);

        //check if downstreamReferences or outgoingAssociations exist on the board
        const amountOfRelationsOnBoard =
          await calculateAmountOfRelationsOnBoard(boardData);

        setButtonDisabled(amountOfRelationsOnBoard == 0);
        setDownstreamRefs(downstreamRefs);
        setAssociations(associations);
        setMiroBoardData(boardData);
      }
      setRelationsLoading(false);
    }

    fetchData();
  }, [data]);

  const calculateAmountOfRelationsOnBoard = async (boardData: BoardNode[]) => {
    let count = 0;
    await Promise.all(
      data.outgoingAssociations.map(async function (outgoingAssociation) {
        const appCardIds = await getAppCardIds(
          outgoingAssociation.itemRevision.id,
          boardData
        );
        count += appCardIds.length;
      })
    );
    await Promise.all(
      data.downstreamReferences.map(async function (downstreamReference) {
        const appCardIds = await getAppCardIds(
          downstreamReference.itemRevision.id,
          boardData
        );
        count += appCardIds.length;
      })
    );
    setRelationsOnBoardCount(count);
    return count;
  };

  const onClickShow = async () => {
    if (data && !buttonDisabled) {
      const startCardIds = await getAppCardIds(
        parseInt(props.itemId.toString()),
        miroBoardData
      );
      const startCardId = startCardIds[0];
      await createConnectorsForDownstreamRefsAndAssociation(
        startCardId,
        downstreamRefs,
        associations,
        miroBoardData
      );
    } else {
      console.warn(
        "Can't load Associations - data still loading or failed to do so."
      );
    }

    setConnectorsAlreadyExist(!connectorsAlreadyExist);
    const newBoard = await miro.board.get();
    setMiroBoardData(newBoard);
  };

  const onClickHide = async () => {
    if (data && !buttonDisabled) {
      const startCardIds = await getAppCardIds(
        parseInt(props.itemId.toString()),
        miroBoardData
      );
      const startCardId = startCardIds[0];
      await removeConnectors(startCardId, miroBoardData);
    } else {
      console.warn(
        "Can't load Associations - data still loading or failed to do so."
      );
    }

    setConnectorsAlreadyExist(!connectorsAlreadyExist);
    const newBoard = await miro.board.get();
    setMiroBoardData(newBoard);
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
