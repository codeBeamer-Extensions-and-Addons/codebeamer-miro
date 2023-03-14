import { Connector } from "@mirohq/websdk-types";
import { Relation } from "../../models/relation.if";
import getAppCardIds from "./getAppCardIds";

export default async function removeConnectros(
  startCardId: string,
  downstreamRefs: [number],
  associations: [{ associationId: number; targetItemId: number }]
) {
  const connectors = (await miro.board.get({
    type: "connector",
  })) as Connector[];

  for (const association of associations) {
    const endCardIds = await getAppCardIds(association.targetItemId);

    // go through each endCardId and check if a connector exists
    for (const endCardId of endCardIds) {
      for (const connector of connectors) {
        const itemData = (await connector.getMetadata("relation")) as Relation;

        if (
          itemData.startCardId === startCardId &&
          itemData.endCardId === endCardId
        ) {
          await miro.board.remove(connector);
        }
      }
    }
  }

  for (const downstreamRef of downstreamRefs) {
    const endCardIds = await getAppCardIds(downstreamRef);

    // go through each endCardId and check if a connector exists
    for (const endCardId of endCardIds) {
      for (const connector of connectors) {
        const itemData = (await connector.getMetadata("relation")) as Relation;

        if (
          itemData.startCardId === startCardId &&
          itemData.endCardId === endCardId
        ) {
          await miro.board.remove(connector);
        }
      }
    }
  }

  return true;
}
