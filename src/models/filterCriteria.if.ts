/**
 * Defines structure of a filter criteria that can be used to filter a query with.
 */
export interface FilterCriteria {
	id: number | string;
	slug: string;
	fieldName: string;
	value: string;
}
