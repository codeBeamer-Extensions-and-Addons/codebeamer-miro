import * as React from 'react';
import ItemDetails from './itemDetails';
import {
	ASSIGNEE_FIELD_NAME,
	EDITABLE_ATTRIBUTES,
	TEAM_FIELD_NAME,
} from '../../constants/editable-attributes';
import { getStore } from '../../store/store';
import { setCbAddress } from '../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../store/slices/userSettingsSlice';

const getSelectControlSelector = (labelDataAttribute: String) => {
	return `[data-test=${labelDataAttribute}] + div .select__control`;
};

const mockItemId = '201284';
const mockCardId = '30642';

describe('<Item>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ItemDetails />);
	});

	it('updates its card its data when opened', () => {
		const mockCbAddress = 'http://test.cb.net/cb';
		const store = getStore();
		store.dispatch(setCbAddress(mockCbAddress));

		cy.intercept(`${mockCbAddress}/api/v3/items/${mockItemId}`, {
			fixture: 'item.json',
		}).as('fetchItem');
		cy.intercept(`**wiki2html`, { statusCode: 200 });

		cy.mountWithStore(
			<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
			{
				reduxStore: store,
			}
		);

		cy.wait('@fetchItem');
		//can't really assert anything more, since the functions that are called to update
		//the item are stubbable as far as I know
	});

	it('has an input for each editable attribute', () => {
		cy.mountWithStore(<ItemDetails />);

		for (let attr of EDITABLE_ATTRIBUTES) {
			//*mind that the data-test attributes are on labels for selects
			cy.getBySel(attr.name).should('exist');
		}
	});

	it('disables the input if the current tracker has no such field', () => {
		const store = getStore();
		const mockTrackerId = '123';
		const mockCbAddress = 'http://test.com/cb';
		store.dispatch(setCbAddress(mockCbAddress));
		store.dispatch(setTrackerId(mockTrackerId));

		cy.intercept('GET', `**/rest/tracker/*/field/*/options`, {
			fixture: 'users_ur.json',
		}).as('fetchOptions');
		//*_minimal doesn't have a "teams" field
		cy.intercept(`**/api/v3/trackers/${mockTrackerId}/schema`, {
			fixture: 'tracker_schema_minimal.json',
		}).as('fetchSchema');

		cy.mountWithStore(<ItemDetails />, { reduxStore: store });
		cy.wait('@fetchSchema');

		cy.get(getSelectControlSelector(TEAM_FIELD_NAME)).should(
			'have.class',
			'select__control--is-disabled'
		);
	});

	context('form interaction', () => {
		describe('example assignee input', () => {
			beforeEach(() => {
				const store = getStore();
				const mockCbAddress = 'http://test.com/cb';
				store.dispatch(setCbAddress(mockCbAddress));

				cy.intercept('GET', `**/api/v3/items/*`, {
					fixture: 'item.json',
				}).as('itemQuery');
				cy.intercept('GET', `**/rest/tracker/*/field/*/options`, {
					fixture: 'users_ur.json',
				}).as('fetchOptions');
				cy.intercept(`**/api/v3/trackers/*/schema`, {
					fixture: 'tracker_schema.json',
				}).as('fetchSchema');

				cy.mountWithStore(
					<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
					{ reduxStore: store }
				);
				cy.wait('@fetchSchema');
			});
			it('has no options initially', () => {
				cy.get(getSelectControlSelector(ASSIGNEE_FIELD_NAME)).should(
					'not.contain.html',
					'option'
				);
			});
			it('loads suitable options after a click on it', () => {
				const filterValue = 'ur';

				cy.get(getSelectControlSelector('assignedTo'))
					//* query is triggered by a click inside the wrapper div
					.click()
					.then(() => {
						cy.wait('@fetchOptions');

						cy.get(getSelectControlSelector('assignedTo'))
							.type(filterValue)
							.then(() => {
								cy.fixture('users_ur.json').then((users) => {
									let selectMenu = cy.get('.select__menu');
									for (let user of users) {
										selectMenu.should(
											'contain.text',
											user.name
										);
									}
								});
							});
					});
			});
			it('allows selecting multiple values', () => {
				const filterValue = 'ur';
				cy.get(getSelectControlSelector('assignedTo'))
					//* query is triggered by a click inside the wrapper div
					.click()
					.then(() => {
						cy.wait('@fetchOptions');

						cy.get(getSelectControlSelector('assignedTo'))
							.type(filterValue)
							.then(() => {
								cy.get('.select__option').first().click();
								cy.get(getSelectControlSelector('assignedTo'))
									.type(filterValue)
									.then(() => {
										cy.get('.select__option')
											.first()
											.click();
										//* just the hardcoded first and second values in users_ur.json
										cy.get('.select__multi-value')
											.first()
											.should('have.text', 'urecha');
										cy.get('.select__multi-value')
											.last()
											.should('have.text', 'urecho');
									});
							});
					});
			});
		});
	});

	context('making updates', () => {
		it('has a button to submit changes', () => {
			cy.mountWithStore(<ItemDetails />);
			cy.getBySel('submit').should('exist');
		});

		it('updates the codeBeamer source item when submitting updates');

		it('displays an error notification when the update failed');

		it('updates the item its miro card when submitting updates');
	});

	context('error handling', () => {
		it('displays an error if the item could not be loaded', () => {
			const store = getStore();
			const mockTrackerId = '123';
			const mockCbAddress = 'http://test.com/cb';
			store.dispatch(setCbAddress(mockCbAddress));
			store.dispatch(setTrackerId(mockTrackerId));

			cy.intercept('GET', `**/api/v3/items/**`, {
				statusCode: 500,
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
		it('displays an error if the tracker schema could not be loaded', () => {
			const store = getStore();
			const mockCbAddress = 'http://test.com/cb';
			store.dispatch(setCbAddress(mockCbAddress));

			cy.intercept('GET', `**/api/v3/items/**`, {
				statusCode: 200,
				fixture: 'item.json',
			}).as('fetchItem');
			cy.intercept(`**/api/v3/trackers/*/schema`, {
				statusCode: 500,
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
