import * as React from 'react';
import { DefaultFilterCriteria } from '../../../../../enums/default-filter-criteria.enum';
import { setTrackerId } from '../../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../../store/store';
import FilterInput from './FilterInput';

const valueInputSelector = 'value-input';
const categorySelectSelector = 'category-select';
const submitButton = 'submit';

describe('<FilterInput>', () => {
	it('mounts', () => {
		cy.mountWithStore(<FilterInput />);
	});

	describe('markup', () => {
		beforeEach(() => {
			cy.mountWithStore(<FilterInput />);
		});

		it('has a text input for the value to filter by', () => {
			cy.getBySel(valueInputSelector).should('exist');
		});
		it('has a select field for the category to filter by', () => {
			cy.getBySel(categorySelectSelector).should('exist');
		});
		it('has a clickable submit-button to add a filter', () => {
			cy.getBySel(submitButton).should('exist');
		});
	});

	describe('category select', () => {
		it('displays the default Filter Criteria as options', () => {
			cy.mountWithStore(<FilterInput />);
			const defaults: String[] = Object.values(DefaultFilterCriteria);

			for (let i = 0; i < defaults.length; i++) {
				cy.getBySel(categorySelectSelector)
					.find(`option[value="${defaults[i]}"]`)
					.should('exist');
			}
		});

		it('displays all of a given Tracker its fields as options', () => {
			const store = getStore();
			const trackerId = '123';
			store.dispatch(setTrackerId(trackerId));

			cy.intercept(`**/api/v3/trackers/${trackerId}/schema`, {
				fixture: 'tracker_schema.json',
			});

			cy.mountWithStore(<FilterInput />);

			cy.fixture('tracker_schema.json').then((json) => {
				for (let field of json) {
					cy.getBySel(categorySelectSelector)
						.find('option')
						.should('contain.text', field.name);
				}
			});
		});
	});

	it('disables the submit button when no value is entered', () => {
		cy.mountWithStore(<FilterInput />);

		cy.getBySel(valueInputSelector).clear();
		cy.getBySel(submitButton).should('be.disabled');
	});

	describe('adding criteria', () => {
		//TODO add a scenario where you don't take a default
		it('adds a filterCriteria in store when a category and value are provided and the submit button is clicked', () => {
			const store = getStore();
			const category = DefaultFilterCriteria.TEAM;
			const value = 'calm';

			cy.spy(store, 'dispatch').as('dispatch');

			cy.mountWithStore(<FilterInput />, { reduxStore: store });

			cy.getBySel(categorySelectSelector).select(category);
			cy.getBySel(valueInputSelector).clear().type(value);
			cy.getBySel(submitButton).click();

			//TODO that method don't yet exist man
			cy.get('@dispatch').should('have.been.calledWith', {
				slug: category,
				fieldName: category,
				value: value,
			});
		});

		it('adds a filterCriteria in store when a non-default category and value are provided and the submit button is clicked', () => {
			const store = getStore();
			const trackerId = '123';
			store.dispatch(setTrackerId(trackerId));

			cy.spy(store, 'dispatch').as('dispatch');

			cy.intercept(`**/api/v3/trackers/${trackerId}/schema`, {
				fixture: 'tracker_schema.json',
			});

			let slug: string = '';
			let category: string = '';
			let value: string = 'down';

			cy.fixture('tracker_schema.json').then((json) => {
				slug = json[0].name;
				category = json[0].trackerItemField;

				cy.mountWithStore(<FilterInput />, { reduxStore: store });

				cy.getBySel(categorySelectSelector).select(slug);
				cy.getBySel(valueInputSelector).clear().type(value);
				cy.getBySel(submitButton).click();

				//TODO that method don't yet exist man
				cy.get('@dispatch').should('have.been.calledWith', {
					slug: slug,
					fieldName: category,
					value: value,
				});
			});
		});

		it('clears the text input when a criteria is added', () => {
			const category = DefaultFilterCriteria.TEAM;
			const value = 'calm';

			cy.mountWithStore(<FilterInput />);

			cy.getBySel(categorySelectSelector).select(category);
			cy.getBySel(valueInputSelector).clear().type(value);
			cy.getBySel(submitButton)
				.click()
				.then(() => {
					cy.getBySel(valueInputSelector).should('have.value', '');
				});
		});
	});
});
