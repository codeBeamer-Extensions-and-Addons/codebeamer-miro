import * as React from 'react';
import { setCbAddress } from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Query from './Query';

describe('<Query>', () => {
	it('mounts', () => {
		cy.mount(<Query />);
	});

	describe('inputs', () => {
		beforeEach(() => {
			cy.mount(<Query />);
		});

		it('has a select to choose trackers from', () => {
			cy.getBySel('trackerSelect');
		});
	});

	describe('tracker select', () => {
		it('displays the project its trackers in the select', () => {
			const store = getStore();
			const cbAddress = 'https://fake.codebeamer.com/cb';
			store.dispatch(setCbAddress(cbAddress));

			cy.intercept(`${cbAddress}/api/v3/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			cy.mountWithStore(<Query />, { reduxStore: store });

			cy.getBySel('trackerSelect')
				.find('option')
				.should('contain.text', 'Features')
				.and('contain.text', 'PBI');
		});

		it('updates the selected Tracker in the store', () => {
			const store = getStore();
			const cbAddress = 'https://fake.codebeamer.com/cb';
			store.dispatch(setCbAddress(cbAddress));

			cy.intercept(`${cbAddress}/api/v3/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			cy.mountWithStore(<Query />, { reduxStore: store });

			cy.spy(store, 'dispatch').as('dispatch');

			cy.getBySel('trackerSelect').select('PBI');

			expect('@dispatch').to.have.been.calledWith(setTrackerId('5'));
		});

		it('automatically selects the cached Tracker if there is one', () => {
			const store = getStore();
			const cbAddress = 'https://fake.codebeamer.com/cb';
			const trackerId = '1';
			store.dispatch(setCbAddress(cbAddress));
			store.dispatch(setTrackerId(trackerId));

			cy.intercept(`${cbAddress}/api/v3/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			cy.mountWithStore(<Query />, { reduxStore: store });

			cy.getBySel('trackerSelect').should('have.value', trackerId);
		});
	});
});
