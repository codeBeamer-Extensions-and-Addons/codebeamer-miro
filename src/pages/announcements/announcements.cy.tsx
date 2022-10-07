import * as React from 'react';
import { setShowAnnouncements } from '../../store/slices/userSettingsSlice';
import { getStore } from '../../store/store';
import Announcements from './Announcements';

describe('<Announcements>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Announcements />);
	});

	it('has a button to close the popup with', () => {
		const store = getStore();
		cy.spy(store, 'dispatch').as('dispatch');

		cy.mountWithStore(<Announcements />, { reduxStore: store });

		cy.getBySel('close-announcements').should('exist');
		cy.getBySel('close-announcements')
			.click({ force: true }) //* forcing because the element will be obstructed by the icon
			.then(() => {
				cy.wait(200);
				cy.get('@dispatch').then((dispatch) => {
					expect(dispatch).to.have.been.calledWith(
						setShowAnnouncements(false)
					);
				});
			});
	});

	it('has a link to go back to the app with', () => {
		const store = getStore();
		cy.spy(store, 'dispatch').as('dispatch');

		cy.mountWithStore(<Announcements />, { reduxStore: store });

		cy.getBySel('skip-announcements').should('exist');
		cy.getBySel('skip-announcements')
			.click()
			.then(() => {
				cy.wait(200);
				cy.get('@dispatch').then((dispatch) => {
					expect(dispatch).to.have.been.calledWith(
						setShowAnnouncements(false)
					);
				});
			});
	});
});
