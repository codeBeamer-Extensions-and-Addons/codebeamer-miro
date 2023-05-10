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
import TrackerDetails from '../models/trackerDetails.if';

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
		await widget.setMetadata('item', {
			id: item.id,
			tracker: {
				id: item.tracker.id,
			},
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
			card.title = card.title?.replace('undefined', trackerKey);
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
	let description = item.description;
	const username = store.getState().userSettings.cbUsername;
	const password = store.getState().userSettings.cbPassword;
	const cbBaseAddress = store.getState().boardSettings.cbAddress;

	const headers = new Headers({
		'Content-Type': 'text/plain',
		Authorization: `Basic ${btoa(username + ':' + password)}`,
	});

	if (item.descriptionFormat == DescriptionFormat.WIKI) {
		//get the formatted description
		try {
			const wiki2htmlRes = await fetch(
				`${cbBaseAddress}/rest/item/${item.id}/wiki2html`,
				{ method: 'POST', body: item.description, headers }
			);
			const html = await wiki2htmlRes.text();
			description = html;
		} catch (e: any) {
			//* It can in fact take ~1 minute until the request actually fails.
			//* Issue lies with codeBeamers inability to accept its failure in converting some wiki2html
			//* and a custom timeout seams impossible
			const message = `Failed fetching formatted description for Item ${item.name}.`;
			console.warn(message);
		}
	}

	//get the tracker details
	try {
		const trackerRes = await fetch(
			`${cbBaseAddress}/api/v3/trackers/${item.tracker.id}`,
			{ method: 'GET', headers }
		);
		const trackerJson = (await trackerRes.json()) as TrackerDetails;
		item.tracker.keyName = trackerJson.keyName;
		item.tracker.color = trackerJson.color;
	} catch (e: any) {
		const message = `Failed fetching tracker details for Item ${item.name}.`;
		console.warn(message);
		miro.board.notifications.showError(message);
	}

	let cardData: Partial<AppCard> = {
		// id: item.id.toString(),
		title: getCardTitle(
			item.id.toString(),
			item.name,
			item.tracker.keyName
		),
		description: description,
		fields: [],
		status: 'connected',
	};

	try {
		addCardFields(cardData, item, appStore);
	} catch (err: any) {
		miro.board.notifications.showError(err);
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
