import { AppCard, BoardNode } from "@mirohq/websdk-types";
import { CodeBeamerItem } from "../../models/codebeamer-item.if";

export default async function getAppCardIds(
  codeBeamerItemId: number,
  boardData: BoardNode[]
) {
  const appCards = boardData.filter(
    (node) => node.type === "app_card"
  ) as AppCard[];
  // const appCards = (await miro.board.get({ type: "app_card" })) as AppCard[];
  const filteredCards = await Promise.all(
    appCards.map(async (card) => {
      const itemData = (await card.getMetadata("item")) as Pick<
        CodeBeamerItem,
        "id"
      >;
      const itemId: number = itemData.id;
      return itemId === codeBeamerItemId ? card.id : null;
    })
  );
  return filteredCards.filter((id) => id !== null);
}
