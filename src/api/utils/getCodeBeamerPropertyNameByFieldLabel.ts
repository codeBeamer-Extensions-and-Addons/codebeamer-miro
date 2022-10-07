import { StandardItemProperty } from '../../enums/standard-item-property.enum';

/**
 * Gets the static codeBeamer Item property name for a {@link StandardItemProperty} value
 * @param fieldLabel
 * @returns Name of the codeBeamer item property labelled by {@link fieldLabel}
 */
export default function getCodeBeamerPropertyNameByFieldLabel(
	fieldLabel: StandardItemProperty
): string {
	switch (fieldLabel) {
		case StandardItemProperty.ID:
			return 'id';
		case StandardItemProperty.TEAMS:
			return 'teams';
		case StandardItemProperty.OWNER:
			return 'owners';
		case StandardItemProperty.RELEASE:
			return 'release';
		case StandardItemProperty.PRIORITY:
			return 'priority';
		case StandardItemProperty.STORY_POINTS:
			return 'storyPoints';
		case StandardItemProperty.SUBJECT:
			return 'subjects';
		case StandardItemProperty.START_DATE:
			return 'startDate';
		case StandardItemProperty.END_DATE:
			return 'endDate';
		case StandardItemProperty.ASSIGNED_TO:
			return 'assignedTo';
		case StandardItemProperty.ASSIGNED_AT:
			return 'assignedAt';
		case StandardItemProperty.SUBMITTED_AT:
			return 'createdAt';
		case StandardItemProperty.SUBMITTED_BY:
			return 'createdBy';
		case StandardItemProperty.MODIFIED_AT:
			return 'modifiedAt';
		case StandardItemProperty.MODIFIED_BY:
			return 'modifiedBy';
	}
}
