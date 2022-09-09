import { AppCard } from '@mirohq/websdk-types';
import { EnhancedStore } from '@reduxjs/toolkit';
import { CodeBeamerItem } from '../models/codebeamer-item.if';
import addCardFields from './utils/addCardFields';
import getCardTitle from './utils/getCardTitle';
import getCbItemUrl from './utils/getCbItemUrl';
import getItemColorField from './utils/getItemColorField';
import getRandomizedInitialCoordSetInViewport from './utils/getRandomizedInitialCoordSetInViewport';

/**
 * Create a new app card base on a codeBeamer item
 * @param item The item to base the card on
 */
export async function createAppCard(item: CodeBeamerItem) {
	const card: Partial<AppCard> = await convertToCardData(item);
	const coords = await getRandomizedInitialCoordSetInViewport();
	card.x = coords.x;
	card.y = coords.y;

	const widget = await miro.board.createAppCard({
		...card,
	});
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
	const card: Partial<AppCard> = await convertToCardData(item, appStore);
	console.log('CardData: ', card);
	let existingAppCard: AppCard;
	try {
		existingAppCard = (await miro.board.get({ id: cardId }))[0] as AppCard;
	} catch (e) {
		//! shouldn't ever happen, unless faultily implemented
		throw new Error(`AppCard with id ${cardId} not found: ${e}`);
	}

	if (!onlyFields) {
		existingAppCard.title = card.title ?? existingAppCard.title;
		existingAppCard.description =
			card.description ?? existingAppCard.description;
	}
	existingAppCard.fields = card.fields ?? existingAppCard.fields ?? [];

	//* keep the status at disconnected, so that one can sync on demand at any time
	//* setting it to 'connected' doesn't make any sense here anyway, since we don't
	//* maintain any kind of active connection with the data source
	existingAppCard.status = 'disconnected';
	await existingAppCard.sync();
}

export async function convertToCardData(
	item: CodeBeamerItem,
	appStore?: EnhancedStore<any>
): Promise<Partial<AppCard>> {
	let cardData: Partial<AppCard> = {
		// id: item.id.toString(),
		title: getCardTitle(
			item.id.toString(),
			item.name,
			item.tracker.keyName
		),
		description: item.description,
		fields: [],
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
