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

    for (const endCardId of endCardIds) {
      for (const connector of connectors) {
        const itemData = (await connector.getMetadata("relation")) as Relation;

        if (
          itemData.startCardId === startCardId &&
          itemData.endCardId === endCardId
        ) {
          try {
            await miro.board.remove(connector);
          } catch (error) {
            console.log("error: ", error);
          }
        }
      }
    }
  }

  for (const downstreamRef of downstreamRefs) {
    const endCardIds = await getAppCardIds(downstreamRef);

    for (const endCardId of endCardIds) {
      for (const connector of connectors) {
        const itemData = (await connector.getMetadata("relation")) as Relation;

        if (
          itemData.startCardId === startCardId &&
          itemData.endCardId === endCardId
        ) {
          try {
            await miro.board.remove(connector);
          } catch (error) {
            console.log("error: ", error);
          }
        }
      }
    }
  }
}
