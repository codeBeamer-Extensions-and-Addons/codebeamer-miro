import { CARD_TITLE_ID_FILTER_REGEX } from '../../constants/cardTitleIdFilterRegex';

export default function getItemIdFromCardTitle(cardTitle: string): string {
	const key = cardTitle.match(CARD_TITLE_ID_FILTER_REGEX);
	if (!key?.length)
		throw Error(
			'Couldn\'t extract ID from Card title. Does your item\'s name contain something like "[*¢*]?"'
		);

	return key[1];
}
