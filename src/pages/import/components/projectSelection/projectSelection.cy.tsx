import * as React from 'react';
import { setProjectId } from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import ProjectSelection from './ProjectSelection';

const projectIdSelector = 'projectId';
const projectSelector = 'project';
const submitSelector = 'submit';
const userFeedbackWrapperSelector = 'user-feedback';

describe('<ProjectSelection>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ProjectSelection />);
	});

	context('inputs', () => {
		beforeEach(() => {
			cy.mountWithStore(<ProjectSelection />);
		});

		it('has a project ID input', () => {
			cy.getBySel(projectIdSelector).should('exist');
		});
		it('has a project select', () => {
			cy.getBySel(projectSelector).should('exist');
		});
		it('has a submit button', () => {
			cy.getBySel(submitSelector);
		});
	});

	it('saves the projectId in store when submitting the form', () => {
		const store = getStore();
		const projectId = 123;

		cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel(projectIdSelector).type(projectId.toString());
		cy.getBySel(submitSelector).click();

		cy.get('@dispatch').then((dispatch) =>
			expect(dispatch).to.have.been.calledWith(setProjectId(projectId))
		);
	});

	it('resets the trackerId when a projectId change is submitted', () => {
		const store = getStore();
		const projectId = 123;
		const trackerId = '';

		cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel(projectIdSelector).type(projectId.toString());
		cy.getBySel(submitSelector).click();

		cy.get('@dispatch').then((dispatch) =>
			expect(dispatch).to.have.been.calledWith(setTrackerId(trackerId))
		);
	});

	it('loads the cached projectId when initializing, putting it into the form', () => {
		const store = getStore();
		const projectId = 1234;
		store.dispatch(setProjectId(projectId));

		cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

		cy.getBySel(projectIdSelector).should('have.value', projectId);
	});

	context('with project data', () => {
		beforeEach(() => {
			cy.intercept('GET', `**/api/v3/projects`, {
				fixture: 'projects.json',
			});
		});

		it('shows loaded projects as options in the respective dropdown', () => {
			cy.mountWithStore(<ProjectSelection />);
			//Melon is the name of a project in the fixture
			cy.getBySel(projectSelector).should('contain.text', 'Melon');
		});

		it('selects a project in the dropdown based on the entered project Id', () => {
			cy.mountWithStore(<ProjectSelection />);

			cy.getBySel(projectIdSelector).type('3');
			cy.get('[data-test="project"] option:selected').should(
				'have.text',
				'Kiwi'
			);
		});

		it('enters the project Id into its input when selecting a project from the dropdown', () => {
			cy.mountWithStore(<ProjectSelection />);

			cy.getBySel(projectSelector).select('Cherry');
			//? not sure, but this might need to go into a then() call
			cy.getBySel(projectIdSelector).should('have.value', '4');
		});

		it('shows an error message if there is no project for an entered Id', () => {
			cy.mountWithStore(<ProjectSelection />);
			cy.getBySel(projectIdSelector).type('8');
			//unfocus input
			cy.get('body').click();
			cy.getBySel('projectIdErrors').should('exist');
		});

		it('communicates the user the success of the operation when the projectId was updated', () => {
			const projectId = '2';
			cy.mountWithStore(<ProjectSelection />);

			cy.getBySel(projectIdSelector).type(projectId);
			cy.getBySel(submitSelector)
				.click()
				.then(() => {
					cy.getBySel(userFeedbackWrapperSelector).should('exist');
					cy.getBySel(submitSelector).should('not.exist');
				});
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
