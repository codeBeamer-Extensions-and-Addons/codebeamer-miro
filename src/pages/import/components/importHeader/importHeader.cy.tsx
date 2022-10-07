import * as React from 'react';
import { setAdvancedSearch } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import ImportHeader from './ImportHeader';

const searchMethodSelector = 'search-method';
const cbqlIconSelector = 'cbql-icon';

describe('<ImportHeader>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ImportHeader />);
	});

	context('actions', () => {
		describe('search-method button', () => {
			it('displays the "CBQL" button by default', () => {
				cy.mountWithStore(<ImportHeader />);

				cy.getBySel(cbqlIconSelector).should('exist');
			});

			describe('with cached setting', () => {
				it('displays "Query Assistant" when "Advanced Search" is enabled in cache', () => {
					const expectedClass = 'icon-parameters';

					const store = getStore();
					store.dispatch(setAdvancedSearch(true));

					cy.mountWithStore(<ImportHeader />, { reduxStore: store });

					cy.getBySel(searchMethodSelector).should(
						'have.class',
						expectedClass
					);
				});

				it('displays "CBQL" when "Advanced Search" is disabled in cache', () => {
					const store = getStore();
					store.dispatch(setAdvancedSearch(false));

					cy.mountWithStore(<ImportHeader />, { reduxStore: store });

					cy.getBySel(cbqlIconSelector).should('exist');
				});
			});

			it('updates the "Advanced Search" userSetting when the CBQL button is clicked', () => {
				const store = getStore();
				store.dispatch(setAdvancedSearch(false));

				cy.spy(store, 'dispatch').as('dispatch');

				cy.mountWithStore(<ImportHeader />, { reduxStore: store });

				cy.getBySel(searchMethodSelector).click();

				cy.get('@dispatch').should(
					'have.been.calledWith',
					setAdvancedSearch(true)
				);
			});
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
