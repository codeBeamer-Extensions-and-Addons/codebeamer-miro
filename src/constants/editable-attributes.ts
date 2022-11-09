/**
 * Enumerates the attributes that shall be editable on an Item's edit page
 */
export const EDITABLE_ATTRIBUTES: EditableAttributeConfig[] = [
	{
		label: 'Assignee',
		name: 'assignedTo',
		type: 'array',
	},
	{
		label: 'Team',
		name: 'teams',
		type: 'array',
	},
	{
		label: 'Story Points',
		name: 'storyPoints',
		type: 'number',
	},
	{
		label: 'Version', //* god damn dude. before it was "release", wasn't it? that's why it won't show on the card anymore
		name: 'versions',
		type: 'array',
	},
	{
		label: 'Subject',
		name: 'subjects',
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
