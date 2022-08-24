import * as React from 'react';
import TabHeader from './TabHeader';

const tab = {
	title: 'Test',
	active: true,
	dataBadge: 1000,
	icon: 'plug',
};

describe('<TabHeader>', () => {
	it('mounts', () => {
		cy.mountWithStore(<TabHeader title={tab.title} />);
	});

	it('displays the passed title', () => {
		cy.mountWithStore(<TabHeader title={tab.title} />);

		cy.getBySel('content').should('contain.text', tab.title);
	});

	// * not using this and didn't actually check how it should work
	it.skip('displays the passed bage', () => {
		cy.mountWithStore(
			<TabHeader title={tab.title} dataBadge={tab.dataBadge} />
		);

		cy.getBySel('content').should('contain.text', tab.dataBadge);
	});

	it('displays the passed icon', () => {
		cy.mountWithStore(<TabHeader title={tab.title} icon={tab.icon} />);

		cy.getBySel('icon')
			.should('exist')
			.and('have.class', `icon-${tab.icon}`);
	});

	it('has the active class when passed the respective prop with value true', () => {
		cy.mountWithStore(<TabHeader title={tab.title} active={true} />);

		cy.getBySel('wrapper').should('have.class', 'tab-active');
	});
	it('does not have the active class when passed the respective prop with value false', () => {
		cy.mountWithStore(<TabHeader title={tab.title} active={false} />);

		cy.getBySel('wrapper').should('not.have.class', 'tab-active');
	});
});
