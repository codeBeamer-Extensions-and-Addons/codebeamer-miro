/**
 * Arbitrary max items to import from codeBeamer at once.
 * This can already take a few dozen seconds.
 */
export const MAX_ITEMS_PER_IMPORT = 250;

/**
 * Arbitrary max items to update at once.
 * This also sets a soft limit on max items to import on a board.
 */
export const MAX_ITEMS_PER_SYNCH = 500;

/**
 * The default result page for fetching data from codeBeamer
 */
export const DEFAULT_RESULT_PAGE = 1;

/**
 * The default page size for fetching data from codebeamer to then display it in the import-table.
 * Basically equal to the available size for the table divided by the size of its rows.
 */
export const DEFAULT_ITEMS_PER_PAGE = 13;
