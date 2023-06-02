import React, { useRef, useState } from 'react';
import { Tooltip, Overlay } from 'react-bootstrap';
import { logError } from '../../../../../api/analytics.api';

export default function ZoomToItemButton(props: { cardId: string | number }) {
	const [showTooltip, setShowTooltip] = useState(false);
	const targetTooltip = useRef(null);

	const zoomToWidget = async () => {
		if (!props.cardId) {
			const message = `Can't zoom to the Item, since its card Id is unknown`;
			miro.board.notifications.showError(message);
			logError(message);
			return;
		}
		let widget = await miro.board.getById(props.cardId.toString());
		if (!widget) {
			const message = `Can't zoom to the Item, since it doesn't exist on the board`;
			miro.board.notifications.showError(message);
			logError(message);
		}
		miro.board.viewport.zoomTo(widget);
	};

	return (
		<>
			{props.cardId && (
				<>
					<button
						ref={targetTooltip}
						className={`button button-tertiary`}
						onClick={zoomToWidget}
						onMouseEnter={() => setShowTooltip(true)}
						onMouseLeave={() => setShowTooltip(false)}
						data-test="zoom-to-item"
					>
						<span className="icon icon-eye clickable"></span>
					</button>
					<Overlay
						target={targetTooltip.current}
						show={showTooltip}
						placement="bottom"
					>
						{(props) => (
							<Tooltip {...props}>Zoom to the Item</Tooltip>
						)}
					</Overlay>
				</>
			)}
		</>
	);
}
