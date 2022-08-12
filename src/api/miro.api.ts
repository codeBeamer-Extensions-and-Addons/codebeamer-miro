import { AppCard } from '@mirohq/websdk-types';
import { CodeBeamerItem } from '../models/codebeamer-item.if';
import addCardFields from './utils/addCardFields';
import getCbItemUrl from './utils/getCbItemUrl';
import getItemColorField from './utils/getItemColorField';
import getRandomizedInitialCoordSetInViewport from './utils/getRandomizedInitialCoordSetInViewport';

//TODO probably remove the "update" part
export async function createOrUpdateItem(item: CodeBeamerItem) {
	const card: Partial<AppCard> = await convertToCardData(item);
	const coords = await getRandomizedInitialCoordSetInViewport();
	card.x = coords.x;
	card.y = coords.y;

	if (card.id) {
		try {
			const existing = await miro.board.getById(card.id);
			//TODO update in theory, but we've got AppCards with sync to some datasource now..
		} catch (err) {
			//*then it couldn't be found, so it usually doesn't exist
		}
	} else {
		const widget = await miro.board.createAppCard({
			...card,
		});
	}
}

export async function convertToCardData(
	item: CodeBeamerItem
): Promise<Partial<AppCard>> {
	let cardData: Partial<AppCard> = {
		// id: item.id.toString(),
		title: `<a href="${getCbItemUrl(item.id.toString())}">${item.name} - [${
			item.tracker.keyName + '-' ?? ''
		}${item.id}]</a>`,
		description: item.description,
		fields: [],
	};

	try {
		addCardFields(cardData, item);
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
