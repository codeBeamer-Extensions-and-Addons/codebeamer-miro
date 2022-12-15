import { AppCard } from '@mirohq/websdk-types';
import React, { useState } from 'react';
import { CARD_TITLE_ID_FILTER_REGEX } from '../constants/regular-expressions';
import { AppCardToItemMapping } from '../models/appCardToItemMapping.if';

/**
 * Queries the AppCards present on the Miro board
 * @returns An array of ${@link AppCardToItemMapping}s matching the AppCards on the board.
 */
export const useImportedItems = () => {
	const [importedItems, setImportedItems] = useState<AppCardToItemMapping[]>(
		[]
	);

	/**
	 * Queries miro for the currently existing app_cards on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create App Cards.
	 * TODO add an additional filter that filters for metadata, once available, to only get "our" cards
	 */
	React.useEffect(() => {
		miro.board.get({ type: 'app_card' }).then((existingCards) => {
			setImportedItems(
				existingCards.map((e) => {
					let card = e as AppCard;

					const itemKey = card.title.match(
						CARD_TITLE_ID_FILTER_REGEX
					);

					if (!itemKey?.length) {
						const message =
							"Couldn't extract ID from Card title. Can't sync!";
						console.error(message);
						miro.board.notifications.showError(message);
						return { appCardId: card.id, itemId: '' };
					}
					const itemId = itemKey[1];

					return { appCardId: card.id, itemId: itemId };
				})
			);
		});
	}, []);

	return importedItems;
};
