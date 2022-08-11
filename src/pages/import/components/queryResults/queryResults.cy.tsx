import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import QueryResults from './QueryResults';

describe('<QueryResults>', () => {
	it('mounts', () => {
		cy.mountWithStore(<QueryResults />);
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

	//TODO when getting to that part
	it.skip('fetches items when the filter changes', () => {});
	describe('lazy loading', () => {
		it.skip('lazy loads');
		it.skip('shows eos info when all items for a query have been loaded');
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
