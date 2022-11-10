import * as React from 'react';
import ItemDetails from './itemDetails';
import { EDITABLE_ATTRIBUTES } from '../../constants/editable-attributes';
import { getStore } from '../../store/store';
import { setCbAddress } from '../../store/slices/boardSettingsSlice';

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
	});

	it('has an input for each editable attribute', () => {
		cy.mountWithStore(<ItemDetails />);

		for (let attr of EDITABLE_ATTRIBUTES) {
			//*mind that the data-test attributes are on labels for selects
			cy.getBySel(attr.name).should('exist');
		}
	});

	context('form interaction', () => {
		describe('assignee input', () => {
			beforeEach(() => {
				const store = getStore();
				const mockCbAddress = 'http://test.com/cb';
				store.dispatch(setCbAddress(mockCbAddress));

				cy.mountWithStore(
					<ItemDetails itemId={mockItemId} cardId={mockCardId} />,
					{ reduxStore: store }
				);
				cy.intercept(
					'GET',
					`**/rest/users/page/1?pagesize=50&filter=*`,
					{
						fixture: 'users_ur.json',
					}
				);
			});
			it('has no options initially', () => {
				cy.get(getSelectControlSelector('assignedTo')).should(
					'not.contain.html',
					'option'
				);
			});
			it('loads suitable options once typing starts', () => {
				const filterValue = 'ur';
				cy.get(getSelectControlSelector('assignedTo'))
					.type(filterValue)
					.then(() => {
						cy.fixture('users_ur.json').then((res) => {
							const users = res.users;
							let selectMenu = cy.get('.select__menu');
							for (let user of users) {
								selectMenu.should('contain.text', user.name);
							}
						});
					});
			});
			it('allows selecting multiple values', () => {
				const filterValue = 'ur';
				cy.get(getSelectControlSelector('assignedTo'))
					.type(filterValue)
					.then(() => {
						cy.get('.select__option').first().click();
						cy.get(getSelectControlSelector('assignedTo'))
							.type(filterValue)
							.then(() => {
								cy.get('.select__option').first().click();
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

		context('select options', () => {
			it('shows a project its teams');
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
});
