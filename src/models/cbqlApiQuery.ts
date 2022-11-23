/**
 * Defines structure of the payload to query CB Entities with generically
 */
export interface CbqlApiQuery {
	page: number;
	pageSize: number;
	queryString: string;
}
