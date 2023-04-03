import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLazyGetWiki2HtmlLegacyQuery } from '../../../api/codeBeamerApi';
import addContextToCBLinks from '../../../api/utils/addContextToCBLinks';
import { CodeBeamerItem } from '../../../models/codebeamer-item.if';
import { RootState } from '../../../store/store';

export default function ItemSummary(props: { item: Partial<CodeBeamerItem> }) {
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

	return (
		<>
			<div className="title sticky">
				<h3 className="h3" data-test="summary-summary">
					{props.item.name}
					{props.item.id && (
						<small className="text-italic">
							{' '}
							#{props.item.id}{' '}
						</small>
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
