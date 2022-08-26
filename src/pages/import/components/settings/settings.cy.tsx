import * as React from 'react';
import Settings from './Settings';

describe('<Settings>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Settings onClose={() => {}} />);
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<Settings onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});
});
