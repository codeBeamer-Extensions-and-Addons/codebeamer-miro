import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import ActiveFilters from './ActiveFilters';

const testCriteria: IFilterCriteria[] = [
	{
		id: 0,
		slug: 'Language',
		fieldName: 'Language',
		value: 'FR',
	},
	{
		id: 0,
		slug: 'Place',
		fieldName: 'place',
		value: 'Avignon',
	},
	{
		id: 0,
		slug: 'Owner',
		fieldName: 'owner',
		value: 'Aurelieng',
	},
];

describe('<ActiveFilters>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ActiveFilters />);
	});

	it('displays a FilterCriteria component for each filterCriteria in store');
	it(
		'removes a filter criteria from store when its component its remove-button is clicked'
	);

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
