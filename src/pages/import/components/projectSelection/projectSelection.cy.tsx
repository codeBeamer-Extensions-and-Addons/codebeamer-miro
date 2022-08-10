import * as React from 'react';
import { setProjectId } from '../../../../store/slices/boardSettingsSlice';
import { getStore } from '../../../../store/store';
import ProjectSelection from './ProjectSelection';

describe('<ProjectSelection>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ProjectSelection />);
	});

	context('inputs', () => {
		beforeEach(() => {
			cy.mountWithStore(<ProjectSelection />);
		});

		it('has a project ID input', () => {
			cy.getBySel('projectId').should('exist');
		});
		it('has a project select', () => {
			cy.getBySel('project').should('exist');
		});
		it('has a submit button', () => {
			cy.getBySel('submit');
		});
	});

	it('saves the projectId in store when submitting the form', () => {
		const store = getStore();
		const projectId = 123;

		cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('projectId').type(projectId.toString());
		cy.getBySel('submit').click();

		cy.get('@dispatch').then((dispatch) =>
			expect(dispatch).to.have.been.calledWith(setProjectId(projectId))
		);
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
			cy.getBySel('project').should('contain.text', 'Melon');
		});

		it('selects a project in the dropdown based on the entered project Id', () => {
			cy.mountWithStore(<ProjectSelection />);

			cy.getBySel('projectId').type('3');
			cy.get('[data-test="project"] option:selected').should(
				'have.text',
				'Kiwi'
			);
		});

		it('enters the project Id into its input when selecting a project from the dropdown', () => {
			cy.mountWithStore(<ProjectSelection />);

			cy.getBySel('project').select('Cherry');
			//? not sure, but this might need to go into a then() call
			cy.getBySel('projectId').should('have.value', '4');
		});

		it('shows an error message if there is no project for an entered Id', () => {
			cy.mountWithStore(<ProjectSelection />);
			cy.getBySel('projectId').type('8');
			//unfocus input
			cy.get('body').click();
			cy.getBySel('projectIdErrors').should('exist');
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
