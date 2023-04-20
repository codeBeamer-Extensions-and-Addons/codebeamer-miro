import { AppData, BoardNode } from "@mirohq/websdk-types";
import doesConnectorExist from "./doesConnectorExist";
import getAppCardIds from "./getAppCardIds";
import { Association, ItemMetadata } from "../../models/api-query-types";

export default async function doAllConnectorsExist(
  startCardId: string,
  downstreamRefIds: number[],
  associations: Association[],
  boardData: BoardNode[],
  metadata: ItemMetadata[]
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

  for (const downstreamRefId of downstreamRefIds) {
    const endCardIds = getAppCardIds(downstreamRefId, metadata);

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
