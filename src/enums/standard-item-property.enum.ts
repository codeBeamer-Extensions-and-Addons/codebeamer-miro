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
	RELEASE = 'Release',
	PRIORITY = 'Priority',
	STORY_POINTS = 'Story Points',
	START_DATE = 'Start Date',
	END_DATE = 'End Date',
	ASSIGNED_TO = 'Assigned To',
	ASSIGNED_AT = 'Assigned At',
	SUBMITTED_AT = 'Submitted At',
	SUBMITTED_BY = 'Submitted By',
	MODIFIED_AT = 'Modified At',
	MODIFIED_BY = 'Modified By',
}
