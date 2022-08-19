import * as React from 'react';
import { setTrackerId } from '../../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../../store/store';
import TrackerSelect from './TrackerSelect';

describe('<TrackerSelect>', () => {
	it('mounts', () => {
		cy.mountWithStore(<TrackerSelect />);
	});

	describe('inputs', () => {
		beforeEach(() => {
			cy.mountWithStore(<TrackerSelect />);
		});

		it('has a select to choose trackers from', () => {
			cy.getBySel('trackerSelect');
		});
	});

	describe('tracker select', () => {
		it('displays the project its trackers in the select', () => {
			cy.intercept(`**/api/v3/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			cy.mountWithStore(<TrackerSelect />);

			cy.getBySel('trackerSelect')
				.find('option')
				.should('contain.text', 'Features')
				.and('contain.text', 'PBI');
		});

		it('updates the selected Tracker in the store', () => {
			cy.intercept(`**/api/v3/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			const store = getStore();

			cy.mountWithStore(<TrackerSelect />, { reduxStore: store });

			cy.spy(store, 'dispatch').as('dispatch');

			cy.getBySel('trackerSelect').select('OKR');

			cy.get('@dispatch').then((dispatch) =>
				expect(dispatch).to.have.been.calledWith(setTrackerId('5'))
			);
		});

		it('automatically selects the cached Tracker if there is one', () => {
			cy.intercept(`**/api/v3/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			const store = getStore();
			const trackerId = '1';
			store.dispatch(setTrackerId(trackerId));

			cy.mountWithStore(<TrackerSelect />, { reduxStore: store });

			cy.getBySel('trackerSelect').should('have.value', trackerId);
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
