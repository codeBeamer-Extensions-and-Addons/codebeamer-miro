import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetWiki2HtmlLegacyQuery } from '../../../api/codeBeamerApi';
import addContextToCBLinks from '../../../api/utils/addContextToCBLinks';
import { CodeBeamerItem } from '../../../models/codebeamer-item.if';
import { displayAppMessage } from '../../../store/slices/appMessagesSlice';
import { RootState } from '../../../store/store';

export default function ItemSummary(props: {
	item: Partial<CodeBeamerItem>;
	cardId?: string;
}) {
	const dispatch = useDispatch();

	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const [displayedItemDescription, setDisplayedItemDescription] =
		useState<string>(props.item.description ?? '');

	const [triggerWiki2HtmlQuery, wiki2HtmlQueryResult] =
		useLazyGetWiki2HtmlLegacyQuery();

	React.useEffect(() => {
		if (!props.item.id || !props.item.description) {
			return;
		}
		triggerWiki2HtmlQuery({
			itemId: props.item.id!,
			markup: props.item.description!,
		});
	}, [props.item.description]);

	React.useEffect(() => {
		if (wiki2HtmlQueryResult.error) {
			console.warn('Failed to convert wiki description to html');
		}
		if (wiki2HtmlQueryResult.data) {
			setDisplayedItemDescription(
				cbAddress
					? addContextToCBLinks(cbAddress, wiki2HtmlQueryResult.data)
					: wiki2HtmlQueryResult.data
			);
		}
	}, [wiki2HtmlQueryResult]);

	const zoomToWidget = async () => {
		const errorMessage = {
			header: 'Error',
			content: "Can't find the item on the board!",
			bg: 'warning',
		};
		if (!props.cardId) {
			dispatch(displayAppMessage(errorMessage));
			return;
		}
		let widget = await miro.board.getById(props.cardId);
		if (!widget) {
			dispatch(displayAppMessage(errorMessage));
		}
		miro.board.viewport.zoomTo(widget);
	};

	return (
		<>
			<div className="title sticky">
				<h3 className="h3" data-test="summary-summary">
					{props.item.name}
					{props.item.id && <small> #{props.item.id} </small>}
					{props.cardId && (
						<span
							className="icon icon-eye clickable pos-adjusted-down"
							title="Click to zoom to the item"
							onClick={() => zoomToWidget()}
							data-test="summary-zoom-to-item"
						></span>
					)}
				</h3>
			</div>
			{displayedItemDescription && (
				<p
					data-test="summary-description"
					className="overflow-ellipsis"
					dangerouslySetInnerHTML={{
						__html: displayedItemDescription,
					}}
				></p>
			)}
		</>
	);
}
