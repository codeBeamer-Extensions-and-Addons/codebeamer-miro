import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import FilterCriteria from './FilterCriteria';

const testCriteria: IFilterCriteria = {
	id: 0,
	slug: 'Language',
	fieldName: 'Language',
	value: 'FR',
};

describe('<FilterCriteria>', () => {
	it('mounts', () => {
		cy.mountWithStore(
			<FilterCriteria filterCriteria={testCriteria} onRemove={() => {}} />
		);
	});

	it('displays given filter its slug');
	it('displays given filter its value');
	it('has a button to remove it with');
	it('calls the passed handler when the remove-button is clicked');

	//TODO If I got time. Else, submit a US.
	describe.skip('AND/OR', () => {
		it('has a button that allows showing a text input when it his hidden');
		it('has a button to remove the text input when it is shown');

		describe('Input', () => {
			it('validates the input to only contain the valid characters'); //being AND, OR and brackets
			it(
				'validates the input to only contain numbers that have respective active filter criteria'
			); //by their id(+1)

			it('displays the input text in green when it is valid');
			it('displays the input text in red when it is invalid');

			it(
				'updates the stored AND/OR string, with filter IDs replaced by their respective CBQL, when submitting'
			);
		});
	});
});
