import React from 'react';

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
					className={`button button-tertiary`}
					onClick={zoomToWidget}
					data-test="zoom-to-item"
					title="Zoom to the Item"
				>
					<span className="icon icon-eye"></span>
				</button>
			)}
		</>
	);
}
