import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import getItemColorField from './getItemColorField';

describe('getItemColorField', () => {
	it('returns the color defined in an item its ColorField custom field', () => {
		const expectedColor = '#0066CC';

		const color = getItemColorField(itemData);

		expect(color).to.equal(expectedColor);
	});
});

const itemData: CodeBeamerItem = {
	id: 1,
	name: 'Copy of superordinate',
	description: 'I wanna be',
	descriptionFormat: 'Wiki',
	createdAt: '2022-02-11T07:34:40.313',
	createdBy: {
		id: 2,
		name: 'tester',
		type: 'UserReference',
		email: 'tester@cypress.io',
	},
	modifiedAt: '2022-02-14T10:21:29.601',
	modifiedBy: {
		id: 2,
		name: 'tester',
		type: 'UserReference',
		email: 'tester@cypress.io',
	},
	owners: [
		{
			id: 2,
			name: 'tester',
			type: 'UserReference',
			email: 'tester@cypress.io',
		},
	],
	version: 6,
	assignedTo: [
		{
			id: 2,
			name: 'tester',
			type: 'UserReference',
			email: 'tester@cypress.io',
		},
		{
			id: 3,
			name: 'lester',
			type: 'UserReference',
			email: 'lester@cypress.io',
		},
	],
	tracker: {
		id: 18,
		name: 'Miro sync test',
		type: 'TrackerReference',
	},
	children: [],
	customFields: [
		{
			type: 'ColorFieldValue',
			value: '#0066CC',
		},
	],
	priority: {
		id: 0,
		name: 'Unset',
		type: 'ChoiceOptionReference',
	},
	status: {
		id: 1,
		name: 'New',
		type: 'ChoiceOptionReference',
	},
	categories: [],
	versions: [],
	ordinal: 0,
	typeName: 'Issue',
	comments: [],
	subjects: [],
	teams: [],
};
