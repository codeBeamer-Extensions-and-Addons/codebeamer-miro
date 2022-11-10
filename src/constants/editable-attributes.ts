export const ASSIGNEE_TECHNICAL_NAME = 'assignedTo';
export const TEAM_TECHNICAL_NAME = 'team';
export const STORY_POINTS_TECHNICAL_NAME = 'storyPoints';
export const VERSION_TECHNICAL_NAME = 'versions';
export const SUBJECT_TECHNICAL_NAME = 'subjects';

/**
 * Enumerates the attributes that shall be editable on an Item's edit page
 */
export const EDITABLE_ATTRIBUTES: EditableAttributeConfig[] = [
	{
		label: 'Assignee',
		name: ASSIGNEE_TECHNICAL_NAME,
		type: 'array',
	},
	{
		label: 'Team',
		name: TEAM_TECHNICAL_NAME,
		type: 'array',
	},
	{
		label: 'Story Points',
		name: STORY_POINTS_TECHNICAL_NAME,
		type: 'number',
	},
	{
		label: 'Version',
		name: VERSION_TECHNICAL_NAME,
		type: 'array',
	},
	{
		label: 'Subject',
		name: SUBJECT_TECHNICAL_NAME,
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
