import React, { useState } from "react";
import { useGetItemRelationsQuery } from "../../../api/codeBeamerApi";
import { createConnectorsForDownstreamRefsAndAssociation } from "../../../api/miro.api";
import Importer from "../../import/components/importer/Importer";
import getAppCardId from "../../../api/utils/getAppCardId";

export default function ItemActions(props: {
  itemId: string | number;
  cardId: string | number;
}) {
  const [
    loadDownstreamReferencesDisabled,
    setloadDownstreamReferencesDisabled,
  ] = useState<boolean>(true);
  const [showDependenciesDisabled, setShowDependenciesDisabled] =
    useState<boolean>(true);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [queryString, setQueryString] = useState<string>("");
  const [downstreamRefs, setDownstreamRefs] = useState<number[]>([]);
  const [associations, setAssociations] = useState([]);
  const [relationsOnBoardCount, setRelationsOnBoardCount] = useState(0);
  const [relationsLoading, setRelationsLoading] = useState(true);
  const { data, error, isLoading } = useGetItemRelationsQuery(props.itemId);

  const loadDownstreamReferencesHandler = () => {
    if (data && !loadDownstreamReferencesDisabled) {
      const ids = data.downstreamReferences.map((d) =>
        d.itemRevision.id.toString()
      );
      setItemIds(ids);
      setQueryString(`item.id IN (${ids.join(",")})`);
    } else {
      console.warn(
        "Can't load Downstream References - data still loading or failed to do so."
      );
    }
  };

  // get all downstreamRefs and associations and then call in the miro.api a method which creates all connectors
  React.useEffect(() => {
    async function fetchData() {
      if (
        data &&
        (data.downstreamReferences.length || data.outgoingAssociations.length)
      ) {
        const downstreamRefs: React.SetStateAction<number[]> = [];
        const associations: { associationId: number; targetItemId: number }[] =
          [];
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

        //check if downstreamReferences or outgoingAssociations exist on the board
        const amountOfRelationsOnBoard =
          await calculateAmountOfRelationsOnBoard();

        setShowDependenciesDisabled(amountOfRelationsOnBoard < 0);
        setRelationsLoading(false);
        setDownstreamRefs(downstreamRefs);
        setAssociations(associations);
      }
    }

    fetchData();
  }, [data]);

  const showDependenciesHandler = async () => {
    if (data && !showDependenciesDisabled) {
      const startCardIds = await getAppCardId(parseInt(props.itemId));
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
  };

  const calculateAmountOfRelationsOnBoard = async () => {
    var count = 0;
    await Promise.all(
      data.outgoingAssociations.map(async function (outgoingAssociation) {
        const appCardIds = await getAppCardId(
          outgoingAssociation.itemRevision.id
        );
        count += appCardIds.length;
      })
    );
    await Promise.all(
      data.downstreamReferences.map(async function (downstreamReference) {
        const appCardIds = await getAppCardId(
          downstreamReference.itemRevision.id
        );
        count += appCardIds.length;
      })
    );
    setRelationsOnBoardCount(count);
    return count;
  };

  React.useEffect(() => {
    if (error) {
      setloadDownstreamReferencesDisabled(true);
      setShowDependenciesDisabled(true);
      return;
    } else if (data) {
      if (!data.downstreamReferences.length) {
        setloadDownstreamReferencesDisabled(true);
      } else {
        setloadDownstreamReferencesDisabled(false);
      }
    }
  }, [data, error]);

  return (
    <div>
      <button
        className={`button button-tertiary ${
          isLoading ? "button-loading button-loading-primary" : ""
        }`}
        onClick={loadDownstreamReferencesHandler}
        disabled={loadDownstreamReferencesDisabled}
        data-test="load-downstream-references"
        title="Load the Item's Downstream References onto the board, if they're not yet there"
      >
        {!isLoading && (
          <>
            <span className="icon-add-row-bottom"></span>
            <span>Load Downstream References</span>
          </>
        )}
        {data && ` (${data.downstreamReferences.length})`}
      </button>
      <button
        className={`button button-tertiary ${
          isLoading ? "button-loading button-loading-primary" : ""
        }`}
        onClick={showDependenciesHandler}
        disabled={showDependenciesDisabled}
        data-test="show-dependency"
        title="Show Dependency & Associations"
      >
        {!relationsLoading && (
          <>
            <span className="icon-add-row-bottom"></span>
            <span>Show Dependency & Associations</span>
          </>
        )}
        {!relationsLoading && ` (${relationsOnBoardCount})`}
      </button>
      {queryString && <Importer items={itemIds} queryString={queryString} />}
    </div>
  );
}
