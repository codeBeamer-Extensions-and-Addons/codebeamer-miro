import doesConnectorExist from "./doesConnectorExist";
import getAppCardIds from "./getAppCardIds";

export default async function doAllConnectorsExist(
  startCardId: string,
  downstreamRefs: [number],
  associations: [{ associationId: number; targetItemId: number }],
  boardData: BoardNode[]
) {
  for (const association of associations) {
    const endCardIds = await getAppCardIds(association.targetItemId, boardData);

    // go through each endCardId and check if a connector exists
    for (const endCardId of endCardIds) {
      const connectorExists = await doesConnectorExist(
        startCardId,
        endCardId,
        boardData
      );
      if (!connectorExists) {
        return false;
      }
    }
  }

  for (const downstreamRef of downstreamRefs) {
    const endCardIds = await getAppCardIds(downstreamRef, boardData);

    // go through each endCardId and check if a connector exists
    for (const endCardId of endCardIds) {
      const connectorExists = await doesConnectorExist(
        startCardId,
        endCardId,
        boardData
      );
      if (!connectorExists) {
        return false;
      }
    }
  }

  return true;
}
