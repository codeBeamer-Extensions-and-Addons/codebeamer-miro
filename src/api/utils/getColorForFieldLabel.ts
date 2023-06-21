import { StandardItemProperty } from '../../enums/standard-item-property.enum';

/**
 * Gets the static color for a given property, to be used as background for its custom card field.
 * @param fieldLabel Fieldlabel to get color for
 * @returns Color to use as background for creating custom card fields for given {@link fieldLabel}
 */
export default function getColorForFieldLabel(
	fieldLabel: StandardItemProperty
): string {
	switch (fieldLabel) {
		case StandardItemProperty.ID:
			return '#bf4040';
		case StandardItemProperty.TEAMS:
			return '#40bf95';
		case StandardItemProperty.OWNER:
			return '#4095bf';
		case StandardItemProperty.VERSIONS:
			return '#406abf';
		case StandardItemProperty.PRIORITY:
			return '#40bfbf';
		case StandardItemProperty.STORY_POINTS:
			return '#bfbf40';
		case StandardItemProperty.SUBJECT:
			return '#f50';
		case StandardItemProperty.START_DATE:
			return '#9540bf';
		case StandardItemProperty.END_DATE:
			return '#bf40bf';
		case StandardItemProperty.ASSIGNED_TO:
			return '#95bf40';
		case StandardItemProperty.ASSIGNED_AT:
			return '#6abf40';
		case StandardItemProperty.SUBMITTED_AT:
			return '#40bf6a';
		case StandardItemProperty.SUBMITTED_BY:
			return '#40bf40';
		case StandardItemProperty.MODIFIED_AT:
			return '#bf9540';
		case StandardItemProperty.MODIFIED_BY:
			return '#bf6840';
		case StandardItemProperty.ESTIMATED_MILLIS:
			return '#9c2400';
		default:
			return '#303030';
	}
}
