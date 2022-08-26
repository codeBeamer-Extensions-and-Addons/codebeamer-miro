import * as React from 'react';
import FilterInput from './FilterInput';

describe('<FilterInput>', () => {
	it('mounts', () => {
		cy.mountWithStore(<FilterInput />);
	});

	describe('markup', () => {
		it('has a text input for the value to filter by');
		it('has a select field for the category to filter by');
		it('has a clickable submit-button to add a filter');
	});

	describe('category select', () => {
		it('displays the default Filter Criteria');
		it('displays all of a given Tracker its fields');
	});

	it('disables the submit button when no value is entered');

	describe('adding criteria', () => {
		it(
			'adds a filterCriteria in store when a category and value are provided and the submit button is clicked'
		);

		it('clears the text input when a criteria is added');
	});
});
