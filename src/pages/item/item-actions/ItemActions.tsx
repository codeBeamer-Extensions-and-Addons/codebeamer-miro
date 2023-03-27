import React from "react";
import LoadDownstreamReferencesButton from "./itemActionsButtons/loadDownstreamReferencesButton/loadDownstreamReferencesButton";
import LoadRelationsButton from "./itemActionsButtons/loadRelationsButton/loadRelationsButton";

export default function ItemActions(props: {
  itemId: string | number;
  cardId: string | number;
}) {
  return (
    <div>
      <LoadDownstreamReferencesButton itemId={props.itemId} />
      <LoadRelationsButton itemId={props.itemId} cardId={props.cardId} />
    </div>
  );
}
