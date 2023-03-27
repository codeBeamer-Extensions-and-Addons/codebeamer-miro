import doesConnectorExist from "./doesConnectorExist";
import getAppCardIds from "./getAppCardIds";

export default async function doAllConnectorsExist(
  startCardId: string,
  downstreamRefs: [number],
  associations: [{ associationId: number; targetItemId: number }],
  boardData: BoardNode[],
  metadata: []
) {
  for (const association of associations) {
    const endCardIds = getAppCardIds(association.targetItemId, metadata);

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
    const endCardIds = getAppCardIds(downstreamRef, metadata);

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
