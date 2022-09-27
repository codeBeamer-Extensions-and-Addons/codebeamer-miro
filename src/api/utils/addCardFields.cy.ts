import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import { store } from '../../store/store';
import addCardFields from './addCardFields';

describe('addCardFields', () => {
	it('adds a field for the Item its status if it has one', () => {
		const expectedFieldValue = `Status: ${itemData.status.name}`;

		const cardData = addCardFields({ id: '1' }, itemData);
		expect(cardData.fields?.some((f) => f.value == expectedFieldValue)).to
			.be.true;
	});

	context(
		'when a property is set to true in the import configuration',
		() => {
			it('adds a field for this property to the card its data', () => {
				cy.stub(store, 'getState').returns({
					boardSettings: {
						cardTagConfiguration: {
							standard: {
								ID: true,
							},
						},
					},
				});

				const expectedFieldValue = `ID: ${itemData.id}`;

				const cardData = addCardFields({ id: '1' }, itemData);
				expect(
					cardData.fields?.some((f) => f.value == expectedFieldValue)
				).to.be.true;
			});

			//TODO not that important
			it.skip('adds a customField for the object-property that shows the object its name property', () => {
				cy.stub(store, 'getState').returns({
					boardSettings: {
						cardTagConfiguration: {
							standard: {
								modifiedBy: true,
							},
						},
					},
				});

				const expectedFieldValue = `Modified By: ${itemData.modifiedBy.name}`;

				const cardData = addCardFields({ id: '1' }, itemData);
				console.log(cardData.fields);
				expect(
					cardData.fields?.some((f) => f.value == expectedFieldValue)
				).to.be.true;
			});

			it.skip(
				'adds a customField with the comma-seperated name properties of each entry of an array-property'
			);
		}
	);
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
	customFields: [],
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
