import { AppCard } from '@mirohq/websdk-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetItemsQuery } from '../../../../../api/codeBeamerApi';
import { updateAppCard } from '../../../../../api/miro.api';
import getColorForFieldLabel from '../../../../../api/utils/getColorForFieldLabel';
import { CARD_TITLE_ID_FILTER_REGEX } from '../../../../../constants/regular-expressions';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../../constants/cb-import-defaults';
import { StandardItemProperty } from '../../../../../enums/standard-item-property.enum';
import { AppCardToItemMapping } from '../../../../../models/appCardToItemMapping.if';
import { CodeBeamerItem } from '../../../../../models/codebeamer-item.if';
import { displayAppMessage } from '../../../../../store/slices/appMessagesSlice';
import { setStandardCardTagConfiguration } from '../../../../../store/slices/boardSettingsSlice';
import { RootState } from '../../../../../store/store';

import './appCardTagSettings.css';

export default function AppCardTagSettings() {
	const dispatch = useDispatch();

	const { cardTagConfiguration } = useSelector(
		(state: RootState) => state.boardSettings
	);
	const [standardConfigurationKeys, setStandardConfigurationKeys] = useState<
		StandardItemProperty[]
	>([]);

	const [isApplying, setIsApplying] = useState(false);
	const [animateSuccess, setAnimateSuccess] = useState(false);
	const [importedItems, setImportedItems] = useState<AppCardToItemMapping[]>(
		[]
	);

	const [trigger, result, lastPromiseInfo] = useLazyGetItemsQuery();

	const defaultTags: string[] = ['Summary', 'Description', 'Status'];

	const standardProperties: string[] = Object.values(StandardItemProperty);

	React.useEffect(() => {
		const keys = Object.keys(cardTagConfiguration.standard);
		let activeStandardConfigurationKeys = [];
		for (let key of keys) {
			if (cardTagConfiguration.standard[key] == true)
				activeStandardConfigurationKeys.push(key);
		}
		setStandardConfigurationKeys(
			activeStandardConfigurationKeys as StandardItemProperty[]
		);
	}, [cardTagConfiguration]);

	const generateStandardPropJSX = (prop: string) => {
		return (
			<div className="property" key={prop}>
				<label
					className="checkbox"
					data-test={`tag-${prop.replace(' ', '-')}`}
				>
					<input
						type="checkbox"
						checked={cardTagConfiguration.standard[prop] ?? false}
						onChange={() =>
							dispatch(
								setStandardCardTagConfiguration({
									property: prop,
									value:
										!cardTagConfiguration.standard[prop] ??
										true,
								})
							)
						}
					/>
					<span>{prop}</span>
				</label>
			</div>
		);
	};

	const applySettings = async () => {
		setIsApplying(true);

		const appCards = await miro.board.get({ type: 'app_card' });
		if (!appCards || !appCards.length) {
			setIsApplying(false);
			dispatch(
				displayAppMessage({
					header: 'No items on the board to apply to',
					bg: 'light',
					delay: 2500,
				})
			);
			return;
		}
		const appCardIdsToItemIds = appCards.map((e) => {
			let card = e as AppCard;

			const itemKey = card.title.match(CARD_TITLE_ID_FILTER_REGEX);

			if (!itemKey?.length) {
				//TODO miro showErrorNotif
				console.error(
					"Couldn't extract ID from Card title. Can't sync!"
				);
				return { appCardId: card.id, itemId: '' };
			}
			const itemId = itemKey[1];

			return { appCardId: card.id, itemId: itemId };
		});

		setImportedItems(appCardIdsToItemIds);

		trigger({
			page: DEFAULT_RESULT_PAGE,
			pageSize: MAX_ITEMS_PER_IMPORT,
			queryString: `item.id IN (${appCardIdsToItemIds
				.map((i) => i.itemId)
				.join(',')})`,
		});
	};

	React.useEffect(() => {
		if (result.error) {
			// console.log(result.error);
			setIsApplying(false);
			// dispatch(
			// 	displayAppMessage({
			// 		header: 'Error loading Items',
			// 		content: <p>Please retry the operation.</p>,
			// 		bg: 'danger',
			// 		delay: 1500,
			// 	})
			// );
		}
		if (result.data) {
			const syncItems = async (items: CodeBeamerItem[]) => {
				const _items: CodeBeamerItem[] = structuredClone(items);
				for (let i = 0; i < _items.length; i++) {
					if (_items[i].categories?.length) {
						if (
							_items[i].categories.find(
								(c) =>
									c.name == 'Folder' ||
									c.name == 'Information'
							)
						) {
							continue;
						}
					}

					const appCardId = importedItems.find(
						(item) => item.itemId == _items[i].id.toString()
					)?.appCardId;
					if (!appCardId) {
						dispatch(
							displayAppMessage({
								header: 'Failed updating an item',
								content: `<p>
										Failed updating card for Item 
										${_items[i].name}
									</p>`,
								bg: 'warning',
								delay: 2500,
							})
						);
						continue;
					}

					await updateAppCard(_items[i], appCardId, true);
				}
			};

			syncItems(result.data.items as CodeBeamerItem[]).then(() => {
				setIsApplying(false);
				setAnimateSuccess(true);
				setTimeout(() => {
					setAnimateSuccess(false);
				}, 2000);
			});
		}
	}, [result]);

	return (
		<div className="flex-col">
			<div>
				<p className="muted-medium">
					Select the properties you want to be displayed as Tags on
					the imported Items' Cards.
					<br />
					Items that don't have a selected property won't display the
					tag for it.
				</p>
			</div>
			<div className="my-2 grid">
				<div className="cs1 ce6 border-right-light">
					{defaultTags.map((dt) => (
						<div className="property" key={dt}>
							<label
								className="checkbox"
								title="Default property"
								data-test={`defaultTag-${dt}`}
							>
								<input type="checkbox" disabled checked />
								<span className="muted-medium">{dt}</span>
							</label>
						</div>
					))}
					{standardProperties
						.filter((p, i) => i % 2 == 1)
						.map((p) => generateStandardPropJSX(p))}
				</div>
				<div className="cs7 ce12">
					{standardProperties
						.filter((p, i) => i % 2 == 0)
						.map((p) => generateStandardPropJSX(p))}
				</div>
			</div>
			<div className="text-center">
				{!animateSuccess && (
					<button
						className={`button button-primary button-small mt-5 ${
							isApplying ? 'button-loading' : ''
						}`}
						onClick={() => applySettings()}
						data-test="apply"
					>
						Apply
					</button>
				)}
				{animateSuccess && (
					<span>
						<svg
							className="checkmark"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 52 52"
						>
							<circle
								className="checkmark__circle"
								cx="26"
								cy="26"
								r="25"
								fill="none"
							/>
							<path
								className="checkmark__check"
								fill="none"
								d="M14.1 27.2l7.1 7.2 16.7-16.8"
							/>
						</svg>
					</span>
				)}
			</div>
			<hr />
			<div className="align-self-center mt-3">
				<h3 className="h3">Card Preview</h3>
				<div className="app-card">
					<h1 className="app-card--title">
						<a href="#">Sample Item [TRKR-1248]</a>
					</h1>
					<h1 className="app-card--description p-medium">
						The Item's description will be rendered as HTML, as far
						as supported by Miro.
					</h1>
					<div className="app-card--body">
						<div className="app-card--tags">
							{standardConfigurationKeys.map((c) => (
								<span
									className="tag"
									key={c}
									style={{
										color: '#ffffff',
										backgroundColor:
											getColorForFieldLabel(c),
									}}
								>
									{c}: {samplePropertyValues[c]}
								</span>
							))}
						</div>
						<svg
							className="app-card--app-logo"
							enableBackground="new 0 0 256 256"
							version="1.1"
							viewBox="0 0 256 256"
							xmlns="http://www.w3.org/2000/svg"
							height="24"
							width="24"
						>
							<path
								d="m142.7 103.9c1.4 12.6 2.6 29.3 21.5 18.5 0.5-0.2 0.9-0.5 1.2-0.7 4.5-6.7-0.2-20.9 5.1-20 5.9 1-1.2 7.6 1.8 12.7 3.1-2.1 3.6-11 7.9-8.3 4.2 2.6-3.4 5.6-3.7 8.9 2.7 1.4 10.4-6 11.4-0.7 0.9 4-9.3 3.4-10.3 5.4 2.1 3.3 12.7 0.7 10.1 6-2.2 4.4-9.4-3.3-13.6-2 1.2 3.7 8.9 4.4 5.7 8-2.9 3.3-6.8-2.5-11.7-7.1-0.6 0.7-1.2 1.4-1.9 2.1-11.9 11.9-26 8.9-33.2-3.5-3.5-6-3.3-9.7-4.3-16.2-1.3 4-2.2 7.8-2.6 11.6-10.5 9.2-19.8 19.1-22.8 34.2 7-5.5 13.6-13.1 20.4-9.8 6.4 3.1 11.4 12.6 13.6 20.2 6.1-2.8 11.2-5.8 12.8-1.6 1.9 5.3-6.8 2.8-9.6 6.4 4 3.1 15.1-2.4 15.7 3.3 0.7 6.9-9.9-0.4-13.6 2.4 0.3 2.6 11.6 6.1 9.1 10.1-3.4 5.3-8.9-5.9-12.3-5.6-1.1 3.8 5.9 10.1 0.3 11.3-5.9 1.2-2.7-8.7-5.2-12.3-5.4 4.2-0.3 14.4-7.2 13.1-6-1.2 4-13.8 2.9-23-2.8-3.3-5.9-6.5-8.9-5.4-6.3 2.5-6.7 9.3-17.9 13.6 8.8 17 33.4 33.9 57.1 32.4 21.4-1.4 46-18.3 36.6-55.5-1.2-4.7-1-6.5 2.1-0.7 14.2 26.8-4.8 72.1-54.3 66.8-58.6-6.2-63.2-56.8-81.2-61.2-4-1-8.1 3.1-11.7 6.2 0.4 8.3 5.1 17.8-0.4 18.4-5.2 0.6-1-6.8-3.7-10.1-3.7 2.9-1.1 14.3-6.5 13.5-6.4-0.9 2.6-8.9 0.8-12.8-2.5-0.3-8.1 9.2-11.2 6-4.2-4.3 7.3-6.7 7.7-9.9-3.2-1.8-10.6 3.2-10.4-2.2 0.2-5.5 8.5-0.5 12.4-2-2.7-5.9-13.1-3.5-10.4-9.5 1.8-3.9 7.4 1.8 13.8 5.3 2-8.1 11.3-21.4 18-21.9 5.4-0.4 9.9 4.1 14.4 8.9-0.2-2.6-0.2-5.2-0.1-7.9 0.5-24.5 9.5-46.2 44.9-61.1 1.4-10.4-9.9-13.4-8-20.8 1.6-5.7 9.5-10.9 16.3-12.7-2.9-5.5-6.5-10.2-2.8-11.9 4.4-2 2.8 5.7 6.1 7.8 2.4-3.6-3-12.7 1.9-13.6 5.8-1 0.2 8.4 2.9 11.4 2.2-0.4 4.4-10.3 8-8.4 4.8 2.6-4.5 7.9-3.9 10.8 3.3 0.7 8.2-5.7 9.6-1 1.4 4.9-7.3 2.8-10.2 5.2 3.9 4.4 12.3-0.5 11.6 5.4-0.6 4.9-10.8-1.8-18.5-1.2-3.3 2.5-7.2 6.1-7 9.4 0.3 5 6.7 9 10.6 13.4 7.4-3.2 6.6-10.9 12-13.8 20-11 51.4 6.3 51.6 14.9 0.1 8.2-17.3 19.7-32.1 23.2-3.5 0.8-6.1-0.5-8.4-1.8-8.8-5.3-11.7 3.1-18.3 9.4"
								fill="#000"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}

const samplePropertyValues = {
	ID: '124926',
	Teams: 'Beavers, Zebras',
	Owner: 'aurech',
	Versions: 'PI 3.2',
	Priority: 'Medium',
	'Story Points': '8',
	Subjects: 'A big feature',
	'Start Date': '2022-03-15',
	'End Date': '2022-04-02',
	'Assigned To': 'urecha',
	'Assigned At': '2022-03-05',
	'Submitted At': '2022-02-27',
	'Submitted By': 'aurech',
	'Modified At': '2022-04-01',
	'Modified By': 'urecha',
};
