import { AppCard } from '@mirohq/websdk-types';
import { EnhancedStore } from '@reduxjs/toolkit';
import { CodeBeamerItem } from '../models/codebeamer-item.if';
import { store } from '../store/store';
import addCardFields from './utils/addCardFields';
import getCardTitle from './utils/getCardTitle';
import getItemColorField from './utils/getItemColorField';

import { DescriptionFormat } from '../enums/descriptionFormat.enum';
import getConcentricCircleCoords from './utils/getConcentricCircleCoords';
import { CardSpawningMethod } from '../enums/cardSpawningMethod.enum';
import getRandomCoordSetPerSubject from './utils/getRandomCoordSetPerSubject';
import getSnailCoordSetPerSubject from './utils/getSnailCoords';
import { CARD_TITLE_TRKR_ITEMID_FILTER_REGEX } from '../constants/regular-expressions';

/**
 * Create a new app card base on a codeBeamer item
 * @param item The item to base the card on
 * @param distributedSpawning Set to false for the item to be spawned roughly in the viewport's center, to true for distribution using the full vp dimensions.
 */
export async function createAppCard(
	item: CodeBeamerItem,
	cardSpawningMethod: CardSpawningMethod = CardSpawningMethod.CONCENTRIC_CIRCLES
) {
	const card: Partial<AppCard> = await convertToCardData(item);
	let coords: { x: number; y: number };

	switch (cardSpawningMethod) {
		case CardSpawningMethod.CONCENTRIC_CIRCLES: {
			coords = await getConcentricCircleCoords(item);
			break;
		}
		case CardSpawningMethod.RANDOM_IN_VIEWPORT: {
			coords = await getRandomCoordSetPerSubject(item);
			break;
		}
		case CardSpawningMethod.SNAIL: {
			coords = await getSnailCoordSetPerSubject(item);
			break;
		}
	}

	card.x = coords.x;
	card.y = coords.y;

	try {
		const widget = await miro.board.createAppCard({
			...card,
		});
	} catch (error) {
		console.error(error);
	}
}

/**
 * Update an existing appCard with potentially new data
 * @param item The updated codeBeamer item data
 * @param cardId The id of the appCard the given item maps to
 */
export async function updateAppCard(
	item: CodeBeamerItem,
	cardId: string,
	onlyFields: boolean = false,
	appStore?: EnhancedStore<any>
) {
	const card: Partial<AppCard> = await convertToCardData(item);
	let existingAppCard: AppCard;
	try {
		existingAppCard = (await miro.board.get({ id: cardId }))[0] as AppCard;
	} catch (e) {
		//! shouldn't ever happen, unless faultily implemented
		throw new Error(`AppCard with id ${cardId} not found: ${e}`);
	}

	if (!onlyFields) {
		const trackerKeyMatch = existingAppCard.title.match(
			CARD_TITLE_TRKR_ITEMID_FILTER_REGEX
		);
		if (card.title && trackerKeyMatch && trackerKeyMatch.length) {
			let trackerKey = trackerKeyMatch[0].split('|')[0].replace('[', '');
			console.log('Tracker key: ', trackerKey);
			card.title = card.title?.replace('undefined', trackerKey);
			console.log('caredu titeru: ', card.title);
		}
		existingAppCard.title = card.title ?? existingAppCard.title;
		existingAppCard.description =
			card.description ?? existingAppCard.description;
	}
	existingAppCard.fields = card.fields ?? existingAppCard.fields ?? [];
	await existingAppCard.sync();
}

export async function convertToCardData(
	item: CodeBeamerItem,
	appStore?: EnhancedStore<any>
): Promise<Partial<AppCard>> {
	if (item.descriptionFormat == DescriptionFormat.WIKI) {
		const username = store.getState().userSettings.cbUsername;
		const password = store.getState().userSettings.cbPassword;

		const requestArgs = {
			method: 'POST',
			headers: new Headers({
				'Content-Type': 'text/plain',
				Authorization: `Basic ${btoa(username + ':' + password)}`,
			}),
			body: item.description,
		};

		try {
			item.description = await (
				await fetch(
					`${store.getState().boardSettings.cbAddress}/rest/item/${
						item.id
					}/wiki2html`,
					requestArgs
				)
			).text();
		} catch (e: any) {
			//* It can in fact take ~1 minute until the request actually fails.
			//* Issue lies with codeBeamers inability to accept its failure in converting some wiki2html
			//* and a custom timeout seams impossible
			const message = `Failed fetching formatted description for Item ${item.name}.`;
			console.warn(message);
			//TODO miro.showErrorNotification(message);
		}
	}

	let cardData: Partial<AppCard> = {
		// id: item.id.toString(),
		title: getCardTitle(
			item.id.toString(),
			item.name,
			item.tracker.keyName
		),
		description: item.description,
		fields: [],
		status: 'connected',
	};

	try {
		addCardFields(cardData, item, appStore);
	} catch (err: any) {
		//TODO miro.showErrorNotif
	}

	// background Color
	let colorFieldValue = getItemColorField(item);
	let backgroundColor = colorFieldValue
		? colorFieldValue
		: item.tracker.color
		? item.tracker.color
		: null;
	if (backgroundColor) {
		cardData.style = { cardTheme: backgroundColor };
	}

	return cardData;
}
