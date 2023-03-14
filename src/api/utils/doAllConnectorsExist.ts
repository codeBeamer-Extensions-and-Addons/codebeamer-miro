import doesConnectorExist from "./doesConnectorExist";
import getAppCardIds from "./getAppCardIds";

export default async function doAllConnectorsExist(
  startCardId: string,
  downstreamRefs: [number],
  associations: [{ associationId: number; targetItemId: number }]
) {
  for (const association of associations) {
    const endCardIds = await getAppCardIds(association.targetItemId);

    // go through each endCardId and check if a connector exists
    for (const endCardId of endCardIds) {
      const connectorExists = await doesConnectorExist(startCardId, endCardId);
      if (!connectorExists) {
        return false;
      }
    }
  }

  for (const downstreamRef of downstreamRefs) {
    const endCardIds = await getAppCardIds(downstreamRef);

    // go through each endCardId and check if a connector exists
    for (const endCardId of endCardIds) {
      const connectorExists = await doesConnectorExist(startCardId, endCardId);
      if (!connectorExists) {
        return false;
      }
    }
  }

  return true;
}
