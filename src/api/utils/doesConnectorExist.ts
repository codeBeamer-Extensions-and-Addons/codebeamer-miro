import { Connector } from "@mirohq/websdk-types";

export default async function doesConnectorExist(
  startCardId: string,
  endCardId: string,
  boardData: BoardNode[]
) {
  const connectors = boardData.filter(
    (node) => node.type === "connector"
  ) as Connector[];

  let connectorExists = false;

  for (const connector of connectors) {
    if (
      connector.start?.item === startCardId &&
      connector.end?.item === endCardId
    ) {
      connectorExists = true;
      return connectorExists;
    }
  }

  return connectorExists;
}
