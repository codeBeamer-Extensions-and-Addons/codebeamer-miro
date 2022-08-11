import { AppCard } from '@mirohq/websdk-types';
import { CodeBeamerItem } from '../models/codebeamer-item.if';
import addCardFields from './utils/addCustomCardFields';
import getCbItemUrl from './utils/getCbItemUrl';
import getItemColorField from './utils/getItemColorField';

export function createOrUpdateItem(item: CodeBeamerItem) {}

async function convertToCardData(
	item: CodeBeamerItem
): Promise<Partial<AppCard>> {
	let cardData: Partial<AppCard> = {
		id: item.id.toString(),
		title: `<a href="${getCbItemUrl(item.id.toString())}">${item.name} - [${
			item.tracker.keyName + '-' ?? ''
		}${item.id}]</a>`,
		fields: [],
	};

	addCardFields(cardData, item);

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
