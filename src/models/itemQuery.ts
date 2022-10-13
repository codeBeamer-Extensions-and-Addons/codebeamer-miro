/**
 * Defines structure of the payload to query CB Entities with generically
 */
export interface CodeBeamerItemsQuery {
	page: number;
	pageSize: number;
	queryString: string;
}
