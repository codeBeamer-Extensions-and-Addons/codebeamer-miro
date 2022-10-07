import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import FilterCriteria from './FilterCriteria';

const testCriteria: IFilterCriteria = {
	id: 1,
	slug: 'Language',
	fieldName: 'Language',
	value: 'FR',
};

const criteriaSelector = `criteria-${testCriteria.id}`;
const removeButtonSelector = `remove-${testCriteria.id}`;

describe('<FilterCriteria>', () => {
	it('mounts', () => {
		cy.mountWithStore(
			<FilterCriteria filterCriteria={testCriteria} onRemove={() => {}} />
		);
	});

	context('with default data', () => {
		beforeEach(() => {
			cy.mountWithStore(
				<FilterCriteria
					filterCriteria={testCriteria}
					onRemove={() => {}}
				/>
			);
		});

		it('displays given filter its slug', () => {
			cy.getBySel(criteriaSelector).should(
				'contain.text',
				testCriteria.slug
			);
		});

		it('displays given filter its value', () => {
			cy.getBySel(criteriaSelector).should(
				'contain.text',
				testCriteria.value
			);
		});

		it('has a button to remove it with', () => {});
	});

	it('displays given filter its ID when enabled in its call', () => {
		cy.mountWithStore(
			<FilterCriteria
				filterCriteria={testCriteria}
				onRemove={() => {}}
				showId={true}
			/>
		);

		cy.getBySel(criteriaSelector).should(
			'contain.text',
			testCriteria.id! + 1
		);
	});

	it('calls the passed handler with the criteria its id as arg when the remove-button is clicked', () => {
		const spy = cy.spy().as('spy');

		cy.mountWithStore(
			<FilterCriteria
				filterCriteria={testCriteria}
				onRemove={spy}
				showId={true}
			/>
		);

		cy.getBySel(removeButtonSelector).click();

		cy.get('@spy').should('have.been.calledWith', testCriteria.id);
	});
});
