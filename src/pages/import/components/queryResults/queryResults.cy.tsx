import { AppCard } from '@mirohq/websdk-types';
import * as React from 'react';
import { IFilterCriteria } from '../../../../models/filterCriteria.if';
import {
	addFilter,
	setTrackerId,
} from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import QueryResults from './QueryResults';

describe('<QueryResults>', () => {
	it('mounts', () => {
		cy.mountWithStore(<QueryResults />);
	});

	it('queries the already imported items and displays them as checked and disabled when they appear in a query its results', () => {
		const itemOne: Partial<AppCard> = { id: '1', title: '[RETUS-1]' };
		const itemTwo: Partial<AppCard> = { id: '2', title: '[RETUS-2]' };
		const notSyncedItemOne: Partial<AppCard> = { id: '3' };
		const notSyncedItemTwo: Partial<AppCard> = { id: '4' };

		cy.stub(miro.board, 'get').callsFake(() => {
			return Promise.resolve([itemOne, itemTwo]);
		});

		const store = getStore();
		const trackerId = '123';
		store.dispatch(setTrackerId(trackerId));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		cy.getBySel('itemCheck-' + itemOne.id)
			.should('be.checked')
			.and('be.disabled');
		cy.getBySel('itemCheck-' + itemTwo.id)
			.should('be.checked')
			.and('be.disabled');
		cy.getBySel('itemCheck-' + notSyncedItemOne.id)
			.should('not.be.checked')
			.and('be.enabled');
		cy.getBySel('itemCheck-' + notSyncedItemTwo.id)
			.should('not.be.checked')
			.and('be.enabled');
	});

	it('queries items with the cached cbqlString when mounted', () => {
		const store = getStore();
		const trackerId = '123';
		const queryString = `tracker.id IN (${trackerId})`;
		//the cbqlString value in the store is set indirectly whenever value that it depends on change
		store.dispatch(setTrackerId(trackerId));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', queryString);
	});

	it('fetches items whenever the selected tracker changes', () => {
		const store = getStore();
		const initialTrackerId = '1';

		const intermediateTrackerId = '5';
		const intermediateQueryString = `tracker.id IN (${intermediateTrackerId})`;

		const finalTrackerId = '2';
		const finalQueryString = `tracker.id IN (${finalTrackerId})`;

		store.dispatch(setTrackerId(initialTrackerId));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		store.dispatch(setTrackerId(intermediateTrackerId));
		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', intermediateQueryString)
			.then(() => {
				store.dispatch(setTrackerId(finalTrackerId));
				cy.wait('@itemQuery')
					.its('request.body.queryString')
					.should('equal', finalQueryString);
			});
	});

	it('fetches items when the filter changes', () => {
		const store = getStore();
		const trackerId = '123';
		const filter: IFilterCriteria = {
			id: 1,
			slug: 'Place',
			fieldName: 'place',
			value: 'Avignon',
		};
		const expectedQueryString = `tracker.id IN (${trackerId}) AND ('123.${filter.fieldName}' = '${filter.value}')`;

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		store.dispatch(setTrackerId(trackerId));

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		store.dispatch(addFilter(filter));

		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', expectedQueryString);
	});

	describe('lazy loading', () => {
		beforeEach(() => {
			const store = getStore();
			const trackerId = '123';
			//the cbqlString value in the store is set indirectly whenever value that it depends on change
			store.dispatch(setTrackerId(trackerId));

			cy.intercept('POST', `**/api/v3/items/query`, {
				fixture: 'query_multi-page.json',
			}).as('initialQuery');

			cy.mountWithStore(<QueryResults />, { reduxStore: store });

			cy.wait('@initialQuery');
		});

		it('fetches the next result page of the current query when scrolling near the table its bottom', () => {
			cy.on('uncaught:exception', (err, runnable) => {
				//* not providing a new fixture for each page, so we'll get duplicates.
				if (err.message.includes('two children with the same key')) {
					return false;
				}
			});

			const expectedPage = 2;

			cy.intercept('POST', `**/api/v3/items/query`).as('itemQuery');

			cy.getBySel('resultsTable').scrollTo('bottom');

			cy.wait('@itemQuery')
				.its('request.body.page')
				.should('equal', expectedPage);
		});

		it('shows eos info when all items for a query have been loaded', () => {
			cy.intercept('POST', `**/api/v3/items/query`, {
				fixture: 'query_multi-page_2.json',
			}).as('itemQuery');

			cy.getBySel('resultsTable').scrollTo('bottom');
			cy.wait(1000);
			cy.getBySel('resultsTable').scrollTo('bottom');

			cy.getBySel('eosInfo').should('exist');
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
