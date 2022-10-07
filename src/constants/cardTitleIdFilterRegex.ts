/**
 * Regex to filter an Item its ID out of its respective card its title.
 * Just .match() the title and take the first element in the array.
 */
export const CARD_TITLE_ID_FILTER_REGEX = /\[[a-zA-Z0-9_-]*\|?([0-9]+)\]/;
