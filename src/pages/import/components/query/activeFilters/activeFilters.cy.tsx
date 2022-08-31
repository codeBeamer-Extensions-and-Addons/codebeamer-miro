import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import {
	addFilter,
	removeFilter,
	resetCbqlStringToCurrentParameters,
	setAndOrFilter,
	setAndOrFilterEnabled,
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

const showAndOrButtonSelector = 'showAndOr';
const hideAndOrButtonSelector = 'hideAndOr';
const andOrInputSelector = 'andOrInput';

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

	describe.only('AND/OR', () => {
		it('has a button to show the AND/OR logic input', () => {
			cy.mountWithStore(<ActiveFilters />);

			cy.getBySel(hideAndOrButtonSelector).should('not.exist');
			cy.getBySel(showAndOrButtonSelector).should('exist');
		});

		it('applies stored AND/OR logic to the cbql string when the input is toggled to show', () => {
			const store = getStore();
			const andOrLogic = '1 OR 2';
			store.dispatch(setAndOrFilter(andOrLogic));

			cy.spy(store, 'dispatch').as('dispatch');

			cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

			cy.getBySel(showAndOrButtonSelector).click();

			cy.get('@dispatch').then((dispatch) =>
				expect(dispatch).to.have.been.calledWith(
					setAndOrFilter(andOrLogic)
				)
			);
		});

		it('has a button to remove the AND/OR logic input when it is shown', () => {
			const store = getStore();
			store.dispatch(setAndOrFilterEnabled(true));

			cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

			cy.getBySel(showAndOrButtonSelector).should('not.exist');
			cy.getBySel(hideAndOrButtonSelector).should('exist');
		});

		it('exempts AND/OR logic from the cbql string when the input is toggled to hide', () => {
			const store = getStore();
			store.dispatch(setAndOrFilterEnabled(true));

			cy.spy(store, 'dispatch').as('dispatch');

			cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

			cy.getBySel(hideAndOrButtonSelector).click();

			cy.get('@dispatch').then((dispatch) =>
				expect(dispatch).to.have.been.calledWith(
					resetCbqlStringToCurrentParameters()
				)
			);
		});

		it('shows filters their Id(+1)s when showing the AND/OR logic input', () => {
			const store = getStore();
			store.dispatch(setAndOrFilterEnabled(true));
			for (let i = 0; i < testCriteria.length; i++) {
				store.dispatch(addFilter(testCriteria[i]));
			}

			cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

			for (let i = 0; i < testCriteria.length; i++) {
				cy.getBySel(`criteria-${testCriteria[i].id}`)
					.should('exist')
					.and('contain.text', (testCriteria[i].id! + 1).toString());
			}
		});

		describe('Input', () => {
			it('updates the stored AND/OR string when submitting', () => {
				const store = getStore();
				store.dispatch(setAndOrFilterEnabled(true));
				const andOrLogic = '(1 AND (2 OR 3))';

				cy.spy(store, 'dispatch').as('dispatch');

				cy.mountWithStore(<ActiveFilters />, { reduxStore: store });

				cy.getBySel(andOrInputSelector)
					.clear()
					.type(`${andOrLogic}{enter}`);

				cy.get('@dispatch').then((dispatch) =>
					expect(dispatch).to.have.been.calledWith(
						setAndOrFilter(andOrLogic)
					)
				);
			});

			//* nice to have (but a struggle to implement)
			it('validates the input to only contain the valid characters'); //being AND, OR and brackets
			it(
				'validates the input to only contain numbers that have respective active filter criteria'
			); //by their id(+1)
			it('displays the input text in green when it is valid');
			it('displays the input text in red when it is invalid');
		});
	});
	afterEach(() => {
		localStorage.clear();
	});
});
