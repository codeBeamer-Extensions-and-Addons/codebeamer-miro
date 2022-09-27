import { IFilterCriteria } from '../../models/filterCriteria.if';
import { SubqueryLinkMethod } from '../enums/subquery-link-method.enum';
import getQueryEntityNameForCriteria from './getQueryEntityNameForCriteria';

/**
 * Constructs the integral CBQL string to query given tracker's items with given filters and given chaining method.
 * @param filters Filter parameters
 * @param subqueryChaining Method to chain filters together with
 * @param trackerId Id of the tracker to query the items of
 * @returns CBQL query string corresponding to the given specifications
 */
export default function getCbqlString(
	filters: IFilterCriteria[],
	subqueryChaining: string,
	trackerId: string
): string {
	return `tracker.id IN (${trackerId})${getFilterQuerySubstring(
		filters,
		subqueryChaining,
		trackerId
	)}`;
}

/**
 * Constructs the CBQL query substring for the selected filter criteria
 * @returns CBQL Query substring like "AND ... = ..." if any criteria was selected.
 */
function getFilterQuerySubstring(
	filters: IFilterCriteria[],
	chainingMethod: SubqueryLinkMethod | string,
	trackerId?: string
): string {
	if (!filters || !filters.length) return '';

	let index = 0;
	let query = ' AND (';
	for (let filter of filters) {
		const type = filter.fieldName;
		const value = filter.value;

		if (!value || !type) continue;

		const codeBeamerType = getQueryEntityNameForCriteria(type, trackerId);

		query += `${
			index++ == 0 ? '' : ' ' + chainingMethod + ' '
		}${codeBeamerType} = '${value}'`;
	}
	query += ')';
	return query;
}
