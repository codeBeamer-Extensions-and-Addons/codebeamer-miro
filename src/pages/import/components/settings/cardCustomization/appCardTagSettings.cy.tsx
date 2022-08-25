import React from 'react';
import AppCardTagSettings from './AppCardTagSettings';

describe('<AppCardTagSettings', () => {
	it('mounts', () => {
		cy.mountWithStore(<AppCardTagSettings />);
	});

	it('shows a disabled checkbox for each of the three default properties', () => {
		cy.mountWithStore(<AppCardTagSettings />);

		cy.getBySel('defaultTag-summary')
			.find('input[@type="checkbox"]')
			.should('be.disabled');
		cy.getBySel('defaultTag-description')
			.find('input[@type="checkbox"]')
			.should('be.disabled');
		cy.getBySel('defaultTag-status')
			.find('input[@type="checkbox"]')
			.should('be.disabled');
	});

	it('shows a checkbox for each value of the StandardItemProperty');

	it('updates the stored cardTagConfiguration when a value is (un-)checked');
});
