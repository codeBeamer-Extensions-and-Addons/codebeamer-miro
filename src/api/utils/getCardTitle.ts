import getCbItemUrl from './getCbItemUrl';

/**
 * Constructs the default title used for AppCards
 *  @returns A string consisting of an html anchor with form [{trackerKey}-{itemId}] to the item on cb.
 */
export default function getCardTitle(
	itemId: string,
	itemName: string,
	trackerKey?: string
): string {
	return `<a href="${getCbItemUrl(itemId)}">${itemName} - [${
		trackerKey + '|' ?? ''
	}${itemId}]</a>`;
}
