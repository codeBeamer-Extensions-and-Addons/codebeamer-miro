import React, { useState } from "react";
import { createConnectorsForDownstreamRefsAndAssociation } from "../../../../../api/miro.api";
import getAppCardIds from "../../../../../api/utils/getAppCardIds";
import { useItemRelations } from "../../../../../hooks/useItemRelations";
import doAllConnectorsExist from "../../../../../api/utils/doAllConnectorsExist";
import removeConnectors from "../../../../../api/utils/removeConnectors";

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

  const { relations: data, error, isLoading } = useItemRelations(props.itemId);

  // get all downstreamRefs and associations and then call in the miro.api a method which creates all connectors
  React.useEffect(() => {
    async function fetchData() {
      if (
        data &&
        (data.downstreamReferences.length || data.outgoingAssociations.length)
      ) {
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
          parseInt(props.itemId.toString())
        );
        const startCardId = startCardIds[0];
        const connectorsExist = await doAllConnectorsExist(
          startCardId,
          downstreamRefs,
          associations
        );
        setConnectorsAlreadyExist(connectorsExist);

        //check if downstreamReferences or outgoingAssociations exist on the board
        const amountOfRelationsOnBoard =
          await calculateAmountOfRelationsOnBoard();

        setButtonDisabled(amountOfRelationsOnBoard == 0);
        setDownstreamRefs(downstreamRefs);
        setAssociations(associations);
      }
      setRelationsLoading(false);
    }

    fetchData();
  }, [data]);

  const calculateAmountOfRelationsOnBoard = async () => {
    let count = 0;
    await Promise.all(
      data.outgoingAssociations.map(async function (outgoingAssociation) {
        const appCardIds = await getAppCardIds(
          outgoingAssociation.itemRevision.id
        );
        count += appCardIds.length;
      })
    );
    await Promise.all(
      data.downstreamReferences.map(async function (downstreamReference) {
        const appCardIds = await getAppCardIds(
          downstreamReference.itemRevision.id
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
        parseInt(props.itemId.toString())
      );
      const startCardId = startCardIds[0];
      await createConnectorsForDownstreamRefsAndAssociation(
        startCardId,
        downstreamRefs,
        associations
      );
    } else {
      console.warn(
        "Can't load Associations - data still loading or failed to do so."
      );
    }

    setConnectorsAlreadyExist(!connectorsAlreadyExist);
  };

  const onClickHide = async () => {
    if (data && !buttonDisabled) {
      const startCardIds = await getAppCardIds(
        parseInt(props.itemId.toString())
      );
      const startCardId = startCardIds[0];
      await removeConnectors(startCardId, downstreamRefs, associations);
    } else {
      console.warn(
        "Can't load Associations - data still loading or failed to do so."
      );
    }

    setConnectorsAlreadyExist(!connectorsAlreadyExist);
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
        title="Show Dependency & Associations"
      >
        {!relationsLoading && (
          <>
            <span className="icon-add-row-bottom"></span>
            <span>
              {connectorsAlreadyExist
                ? "Hide Dependency & Associations "
                : "Show Dependency & Associations "}
              ({relationsOnBoardCount})
            </span>
          </>
        )}
      </button>
    </>
  );
}

// export const useAmountOfRelationsOnBoardForItem = () => {
//     const [relationsOnBoardCount, setRelationsOnBoardCount] = useState(0);
//     const [data, setData] = useState<RelationsQuery>();

//     React.useEffect(() => {
//       const fetch = async () => {
//         let count = 0;

//         await Promise.all(
//           data.outgoingAssociations.map(async function (outgoingAssociation) {
//             const appCardIds = await getAppCardIds(
//               outgoingAssociation.itemRevision.id
//             );
//             count += appCardIds.length;
//           })
//         );
//         await Promise.all(
//           data.downstreamReferences.map(async function (downstreamReference) {
//             const appCardIds = await getAppCardIds(
//               downstreamReference.itemRevision.id
//             );
//             count += appCardIds.length;
//           })
//         );
//         setRelationsOnBoardCount(count);
//       };

//       fetch();
//     }, [data]);

//     return [relationsOnBoardCount, setData];
//   };
