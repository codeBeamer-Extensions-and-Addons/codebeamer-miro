import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import {
	addFilter,
	removeFilter,
} from '../../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../../store/store';
import ActiveFilters from './ActiveFilters';

const testCriteria: IFilterCriteria[] = [
	{
		id: 0,
		slug: 'Language',
		fieldName: 'Language',
		value: 'FR',
	},
	{
		id: 1,
		slug: 'Place',
		fieldName: 'place',
		value: 'Avignon',
	},
	{
		id: 2,
		slug: 'Owner',
		fieldName: 'owner',
		value: 'Aurelieng',
	},
];

describe('<ActiveFilters>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ActiveFilters />);
	});

	it('displays a FilterCriteria component for each filterCriteria in store', () => {
		const store = getStore();
		for (let i = 0; i < testCriteria.length; i++) {
			store.dispatch(addFilter(testCriteria[i]));
		}

		cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

		for (let i = 0; i < testCriteria.length; i++) {
			cy.getBySel(`criteria-${testCriteria[i].id}`)
				.should('exist')
				.and('contain.text', testCriteria[i].slug);
		}
	});
	it('removes a filter criteria from store when its component its remove-button is clicked', () => {
		const store = getStore();
		const criteriaIndex = 1;
		cy.spy(store, 'dispatch').as('dispatch');

		for (let i = 0; i < testCriteria.length; i++) {
			store.dispatch(addFilter(testCriteria[i]));
		}

		cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

		cy.getBySel(`criteria-${criteriaIndex}`).find('.filter-remove').click();

		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.have.been.calledWith(
				removeFilter(criteriaIndex)
			);
		});
	});

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
