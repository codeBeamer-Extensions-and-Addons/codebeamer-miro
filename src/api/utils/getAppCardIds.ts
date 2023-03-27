export default function getAppCardIds(
  codeBeamerItemId: number,
  metadata: any = []
) {
  const filteredMetadata = metadata.filter(
    (data) =>
      data.type === "app_card" && data.metadata.item.id === codeBeamerItemId
  );
  const appCardIds = filteredMetadata.map((data) => {
    return data.cardId;
  });
  return appCardIds;
}
