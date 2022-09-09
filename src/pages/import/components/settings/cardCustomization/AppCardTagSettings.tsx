import { AppCard } from '@mirohq/websdk-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetItemsQuery } from '../../../../../api/codeBeamerApi';
import { updateAppCard } from '../../../../../api/miro.api';
import { CARD_TITLE_ID_FILTER_REGEX } from '../../../../../constants/cardTitleIdFilterRegex';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../../constants/cb-import-defaults';
import { StandardItemProperty } from '../../../../../enums/standard-item-property.enum';
import { AppCardToItemMapping } from '../../../../../models/appCardToItemMapping.if';
import { CodeBeamerItem } from '../../../../../models/codebeamer-item.if';
import { setStandardCardTagConfiguration } from '../../../../../store/slices/boardSettingsSlice';
import { RootState } from '../../../../../store/store';

import './appCardTagSettings.css';

export default function AppCardTagSettings() {
	const dispatch = useDispatch();

	const { cardTagConfiguration } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const [isApplying, setIsApplying] = useState(false);
	const [animateSuccess, setAnimateSuccess] = useState(false);
	const [importedItems, setImportedItems] = useState<AppCardToItemMapping[]>(
		[]
	);

	const [trigger, result, lastPromiseInfo] = useLazyGetItemsQuery();

	const defaultTags: string[] = ['Summary', 'Description', 'Status'];

	const standardProperties: string[] = Object.values(StandardItemProperty);

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
			console.log(result.error);
			setIsApplying(false);
			//TODO miro.showerrorNotif
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
						//TODO miro.showErrorNotif
						continue;
					}

					await updateAppCard(_items[i], appCardId);
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
		</div>
	);
}
