import React from 'react';
import LoadDownstreamReferencesButton from './itemActionsButtons/loadDownstreamReferencesButton/loadDownstreamReferencesButton';
import LoadRelationsButton from './itemActionsButtons/loadRelationsButton/loadRelationsButton';
import ZoomToItemButton from './itemActionsButtons/zoomToItemButton/ZoomToItemButton';

export default function ItemActions(props: {
	itemId: string | number;
	cardId: string | number;
}) {
	return (
		<div>
			<LoadDownstreamReferencesButton itemId={props.itemId} />
			<LoadRelationsButton itemId={props.itemId} />
			<ZoomToItemButton cardId={props.cardId} />
		</div>
	);
}
