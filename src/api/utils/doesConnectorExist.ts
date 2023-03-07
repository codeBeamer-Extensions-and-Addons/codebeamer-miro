import { Connector } from "@mirohq/websdk-types";
import { Relation } from "../../models/relation.if";

export default async function doesConnectorExist(
  startCardId: string,
  endCardId: string
) {
  const connectors = (await miro.board.get({
    type: "connector",
  })) as Connector[];

  let connectorExists = false;

  for (const connector of connectors) {
    const itemData = (await connector.getMetadata("relation")) as Relation;

    if (
      itemData.startCardId === startCardId &&
      itemData.endCardId === endCardId
    ) {
      connectorExists = true;
      return connectorExists;
    }
  }

  return connectorExists;
}
