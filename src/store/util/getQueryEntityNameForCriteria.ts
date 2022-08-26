import { DefaultFilterCriteria } from '../../enums/default-filter-criteria.enum';

/**
 * Maps FilterCriteria enum values to codeBeamer Query language entity names
 * @param criteria FilterCriteria as enum value or string (for custom fields)
 * @param trackerId Optional trackerId (required only for custom fields)
 * @returns the matching codebeamer query language entity's name to a Filter Criteria, e.g. "teamName" for Team. For non-enumerated criteria, it constructs a customField query string.
 */
export default function getQueryEntityNameForCriteria(
	criteria: DefaultFilterCriteria | string,
	trackerId?: string
): string {
	switch (criteria) {
		case DefaultFilterCriteria.TEAM:
			return 'teamName';
		case DefaultFilterCriteria.RELEASE:
			return 'release';
		case DefaultFilterCriteria.SUBJECT:
			return 'subjectName';
		default:
			return `'${trackerId}.${criteria}'`;
	}
}
