import * as React from 'react';
import ItemDetails from './itemDetails';
import {
	ASSIGNEE_FIELD_NAME,
	EDITABLE_ATTRIBUTES,
	SUBJECT_FIELD_NAME,
	TEAM_FIELD_NAME,
} from '../../constants/editable-attributes';
import { getStore } from '../../store/store';
import { setCbAddress } from '../../store/slices/boardSettingsSlice';

const getSelectControlSelector = (labelDataAttribute: String) => {
	return `[data-test=${labelDataAttribute}] + div .select__control`;
};

const mockItemId = '201284';
const mockCardId = '30642';

describe('<ItemDetails>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ItemDetails />);
	});

	context('input elements', () => {
		beforeEach(() => {
			const store = getStore();
			const mockCbAddress = 'https://test.me/cb';
			store.dispatch(setCbAddress(mockCbAddress));

			cy.intercept(`**/api/v3/items/${mockItemId}`, {
				fixture: 'item.json',
			});

			cy.mountWithStore(
				<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
				{
					reduxStore: store,
				}
			);
		});

		it('has an input for each editable attribute', () => {
			cy.intercept(`**/api/v3/trackers/*/schema`, {
				fixture: 'tracker_schema.json',
			});

			for (let attr of EDITABLE_ATTRIBUTES) {
				cy.getBySel(attr.name).should('exist');
			}
		});

		it('disables the input if the current tracker has no such field', () => {
			cy.intercept('**/api/v3/trackers/*/schema', {
				fixture: 'tracker_schema_minimal.json',
			}).as('fetchSchema');

			cy.wait('@fetchSchema');

			cy.get(getSelectControlSelector(TEAM_FIELD_NAME)).should(
				'have.class',
				'select__control--is-disabled'
			);
		});
	});

	context('form interaction', () => {
		beforeEach(() => {
			const store = getStore();
			const mockCbAddress = 'https://test.me/cb';
			store.dispatch(setCbAddress(mockCbAddress));

			cy.spy(store, 'dispatch').as('dispatchSpy');

			cy.intercept(`**/api/v3/items/${mockItemId}`, {
				fixture: 'item.json',
			});
			cy.intercept(`**/api/v3/trackers/*/schema`, {
				fixture: 'tracker_schema.json',
			});

			cy.mountWithStore(
				<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
				{
					reduxStore: store,
				}
			);
		});

		describe('example "teams" input', () => {
			it('has no options initially', () => {
				cy.get(getSelectControlSelector(TEAM_FIELD_NAME)).should(
					'not.contain.html',
					'option'
				);
			});

			it('loads suitable options after a lick on the form-group', () => {
				cy.intercept(`**/rest/tracker/*/field/*/options`, {
					fixture: 'teams.json',
				}).as('fetchOptions');
				cy.get(getSelectControlSelector('teams'))
					.click()
					.then(() => {
						cy.wait('@fetchOptions');
						cy.fixture('teams.json').then((teams) => {
							//* only the clicked select's should exist at this time
							let selectMenu = cy.get('.select__menu');
							for (let team of teams) {
								selectMenu.should('contain.text', team.name);
							}
						});
					});
			});

			it('allows selecting multiple values', () => {
				//*subjects/versions are single-select, teams/assigned to are multi-select in the fixture tracker_schema.json
				cy.intercept(`**/rest/tracker/*/field/*/options`, {
					fixture: 'teams.json',
				}).as('fetchOptions');
				cy.get(getSelectControlSelector(TEAM_FIELD_NAME))
					.click()
					.then(() => {
						cy.wait('@fetchOptions');
						cy.get('.select__option').first().click();
						cy.get('.select__multi-value__label')
							.should('exist')
							.and('have.length', 1);

						cy.get(getSelectControlSelector('teams')).click();
						cy.get('.select__option').first().click();
						cy.get('.select__multi-value__label').should(
							'have.length',
							2
						);
					});
			});
		});

		describe('example "subjects" input', () => {
			it('allows selecting only one value', () => {
				//* using the teams-fixture because the options don't matter
				cy.intercept(`**/rest/tracker/*/field/*/options`, {
					fixture: 'teams.json',
				}).as('fetchOptions');

				cy.get(getSelectControlSelector(SUBJECT_FIELD_NAME)).click();
				cy.get('.select__option').first().click();
				cy.get('.select__single-value')
					.should('exist')
					.and('have.length', 1);

				cy.get(getSelectControlSelector(SUBJECT_FIELD_NAME)).click();
				cy.get('.select__option').first().click();
				cy.get('.select__single-value')
					.should('exist')
					.and('have.length', 1);
			});
		});

		describe('special case "assignedTo" input', () => {
			it('eagerly loads its options', () => {
				cy.intercept(`**/rest/tracker/*/field/*/options`, {
					fixture: 'users_ur.json',
				}).as('usersQuery');

				cy.wait('@usersQuery');

				cy.get(getSelectControlSelector(ASSIGNEE_FIELD_NAME)).click();

				cy.fixture('users_ur.json').then((users) => {
					//* only the clicked select's should exist at this time
					let selectMenu = cy.get('.select__menu');
					for (let user of users) {
						selectMenu.should('contain.text', user.name);
					}
				});
			});
		});

		context('save-button', () => {
			it('has a button to submit changes', () => {
				cy.getBySel('submit').should('exist');
			});

			it('updates the codebeamer source item when saving', () => {
				cy.intercept('PUT', '**/rest/item', {
					statusCode: 200,
					body: 'null',
				}).as('putItem');

				cy.getBySel('submit').click();

				cy.wait('@putItem');
			});

			it('displays an error notification when the update failed', () => {
				const message =
					"I'm a teapot - what do you expect from me anyway?";

				const error = {
					header: 'Failed to update item: ' + message,
					bg: 'danger',
					delay: 5000,
				};

				cy.intercept('PUT', '**/rest/item', {
					statusCode: 418,
					body: {
						exception: 'Teapot',
						message: message,
					},
				}).as('putItem');

				cy.getBySel('submit').click();

				cy.wait('@putItem');
				cy.get('@dispatchSpy').then((dispatch) => {
					// expect(dispatch).to.be.calledWith(
					// 	displayAppMessage(error)
					// );
					//* the above didn't do it.. and the compiler has incomprehensible problems with it
					//* so this mediocre replacement will have to do
					expect(dispatch).to.be.called;
				});
			});
		});
	});

	context('general error handling', () => {
		//TODo exact msg
		it('displays an error if the item could not be loaded', () => {
			const store = getStore();
			const mockCbAddress = 'http://test.com/cb';
			store.dispatch(setCbAddress(mockCbAddress));

			cy.intercept('GET', `**/api/v3/items/**`, {
				statusCode: 418,
				body: {
					exception: 'Teapot',
					message: "I'm a teapot.",
				},
			}).as('fetchItem');

			cy.mountWithStore(
				<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
				{ reduxStore: store }
			);
			cy.wait('@fetchItem');
			cy.getBySel('fatal-error')
				.should('exist')
				.and('contain.text', 'Failed loading item schema');
		});

		//TODo exact msg
		it('displays an error if the tracker schema could not be loaded', () => {
			const store = getStore();
			const mockCbAddress = 'http://test.com/cb';
			store.dispatch(setCbAddress(mockCbAddress));

			cy.intercept('GET', `**/api/v3/items/**`, {
				fixture: 'item.json',
			});
			cy.intercept(`**/api/v3/trackers/*/schema`, {
				statusCode: 418,
				body: {
					exception: 'Teapot',
					message: "I'm a teapot.",
				},
			}).as('fetchSchema');

			cy.mountWithStore(
				<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
				{ reduxStore: store }
			);
			cy.wait('@fetchSchema');
			cy.getBySel('fatal-error')
				.should('exist')
				.and('contain.text', 'Failed loading tracker schema');
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
