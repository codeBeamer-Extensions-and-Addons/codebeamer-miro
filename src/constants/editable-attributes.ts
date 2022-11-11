export const ASSIGNEE_LEGACY_NAME = 'assignedTo';
export const ASSIGNEE_FIELD_NAME = 'assignedTo';
export const TEAM_LEGACY_NAME = 'team';
export const TEAM_FIELD_NAME = 'teams';
export const STORY_POINTS_LEGACY_NAME = 'storyPoints';
export const STORY_POINTS_FIELD_NAME = 'storyPoints';
export const VERSION_LEGACY_NAME = 'versions';
export const VERSION_FIELD_NAME = 'versions';
export const SUBJECT_LEGACY_NAME = 'realizedFeature';
export const SUBJECT_FIELD_NAME = 'subjects';

/**
 * Enumerates the attributes that shall be editable on an Item's edit page
 */
export const EDITABLE_ATTRIBUTES: EditableAttributeConfig[] = [
	{
		label: 'Assignee',
		name: ASSIGNEE_FIELD_NAME,
		legacyName: ASSIGNEE_LEGACY_NAME,
		type: 'array',
	},
	{
		label: 'Team',
		name: TEAM_FIELD_NAME,
		legacyName: TEAM_LEGACY_NAME,
		type: 'array',
	},
	{
		label: 'Story Points',
		name: STORY_POINTS_FIELD_NAME,
		legacyName: STORY_POINTS_LEGACY_NAME,
		type: 'number',
	},
	{
		label: 'Version',
		name: VERSION_FIELD_NAME,
		legacyName: VERSION_LEGACY_NAME,
		type: 'array',
	},
	{
		label: 'Subject',
		name: SUBJECT_FIELD_NAME,
		legacyName: SUBJECT_LEGACY_NAME,
		type: 'array',
	},
];
/**
 * Configuration entry defining an editable attribute
 */
export interface EditableAttributeConfig {
	/**
	 * Human-readable label
	 */
	label: string;
	/**
	 * Technical field name
	 */
	name: string;
	/**
	 * Legacy field name
	 */
	legacyName: string;
	/**
	 * Type of the field's value(s)
	 */
	type: 'array' | 'object' | 'string' | 'number';
}

export function getDefaultValueForType(
	type: 'array' | 'object' | 'string' | 'number'
): [] | { name: '' } | 0 | '' {
	switch (type) {
		case 'array':
			return [];
		case 'object':
			return { name: '' };
		case 'string':
			return '';
		case 'number':
			return 0;
	}
}
