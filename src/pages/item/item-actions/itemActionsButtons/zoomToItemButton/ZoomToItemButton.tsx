import React from "react";
import { Tooltip } from "react-tooltip";

export default function ZoomToItemButton(props: { cardId: string | number }) {
  const zoomToWidget = async () => {
    if (!props.cardId) {
      miro.board.notifications.showError(
        `Can't zoom to the Item, since its card Id is unknown`
      );
      return;
    }
    let widget = await miro.board.getById(props.cardId.toString());
    if (!widget) {
      miro.board.notifications.showError(
        `Can't zoom to the Item, since it doesn't exist on the board`
      );
    }
    miro.board.viewport.zoomTo(widget);
  };

  return (
    <>
      {props.cardId && (
        <button
          data-tooltip-id="zoomToItemButton"
          data-tooltip-content="Zoom to the Item"
          className={`button button-tertiary`}
          onClick={zoomToWidget}
          data-test="zoom-to-item"
        >
          <span className="icon icon-eye clickable"></span>
        </button>
      )}
      <Tooltip
        id="zoomToItemButton"
        style={{ position: "absolute", bottom: 0 }}
      />
    </>
  );
}
