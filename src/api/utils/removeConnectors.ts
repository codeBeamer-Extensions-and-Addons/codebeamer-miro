import { BoardNode, Connector } from "@mirohq/websdk-types";

export default async function removeConnectors(
  startCardId: string,
  boardData: BoardNode[]
) {
  const connectors = boardData.filter(
    (node) => node.type === "connector"
  ) as Connector[];

  const connectorsToStartCard = connectors.filter((connector) => {
    return connector.start?.item === startCardId;
  });

  connectorsToStartCard.forEach(async (connector) => {
    await miro.board.remove(connector);
  });
}
