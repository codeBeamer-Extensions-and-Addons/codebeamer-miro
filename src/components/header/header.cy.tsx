import Header from './Header';
import * as React from 'react';

describe('<Header>', () => {
	it('mounts', () => {
		cy.mount(<Header />);
	});

	it('can be centered by passing a prop', () => {
		cy.mount(<Header centered={true} />);

		cy.get('header')
			.should('have.class', 'text-center')
			.and('have.css', 'text-align', 'center');
	});

	it('displays passed children inside a <h1/> element', () => {
		cy.mount(
			<Header>
				<p>test</p>
			</Header>
		);

		cy.getBySel('header-container').find('p').should('have.text', 'test');
	});
});
