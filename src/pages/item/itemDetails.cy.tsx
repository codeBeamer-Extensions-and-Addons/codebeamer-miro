import * as React from 'react';
import ItemDetails from './itemDetails';
import { EDITABLE_ATTRIBUTES } from '../../constants/editable-attributes';

describe('<Item>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ItemDetails />);
	});

	it('updates its card its data when opened', () => {
		cy.mountWithStore(<ItemDetails />);
	});

	it.only('has an input for each editable attribute', () => {
		cy.mountWithStore(<ItemDetails />);

		for (let attr of EDITABLE_ATTRIBUTES) {
			cy.getBySel(attr.name).should('exist');
		}
	});

	context('making updates', () => {
		it('has a button to submit changes');

		it('updates the codeBeamer source item when submitting updates');

		it('displays an error notification when the update failed');

		it('updates the item its miro card when submitting updates');
	});
});
