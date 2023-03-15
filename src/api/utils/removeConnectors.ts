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

  const connectorsToStartCard = connectors.filter((connector) => {
    return connector.start.item === startCardId;
  });

  connectorsToStartCard.forEach(async (connector) => {
    await miro.board.remove(connector);
  });

  console.log(connectorsToStartCard);
}
