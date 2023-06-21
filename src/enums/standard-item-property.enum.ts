/**
 * Enumerates the "standard" ~atomic (of type number, text, choice, date, duration and user-reference) properties of any codeBeamer item.
 * In fact, there seems to not be a set-in-stone standard, which all cb items must have in common (but maybe the ID).
 * Therefore, this enumeration only lists the presumably most common properties. To decide what's "most common", only trackers
 * and Stakeholder-requirements in the Retina (custom codeBeamer) Toolchains project at Roche Diagnostics were considered.
 */
export enum StandardItemProperty {
	ID = 'ID',
	TEAMS = 'Teams',
	OWNER = 'Owner',
	VERSIONS = 'Versions',
	PRIORITY = 'Priority',
	STORY_POINTS = 'Story points',
	SUBJECT = 'Subjects',
	START_DATE = 'Start date',
	END_DATE = 'End date',
	ASSIGNED_TO = 'Assigned to',
	ASSIGNED_AT = 'Assigned at',
	SUBMITTED_AT = 'Submitted at',
	SUBMITTED_BY = 'Submitted by',
	MODIFIED_AT = 'Modified at',
	MODIFIED_BY = 'Modified by',
	ESTIMATED_MILLIS = 'Estimated effort',
}
