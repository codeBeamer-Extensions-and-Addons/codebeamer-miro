import { Connector } from "@mirohq/websdk-types";

export default async function doesConnectorExist(startCardId: string, endCardId: string) {
  const connectors = await miro.board.get({ type: 'connector' }) as Connector[];

  let connectorExists = false;

  for (const connector of connectors) {
    const itemData = await connector.getMetadata('relation');
    const start = itemData['startCardId'];
    const end = itemData['endCardId'];

    if (start === startCardId && end === endCardId) {
      connectorExists = true;
      break;
    }
  }

  return connectorExists;
}
