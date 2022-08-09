import {
	setCbAddress,
	setProjectId,
} from '../../../../store/slices/boardSettingsSlice';
import { setCredentials } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import ProjectSelection from './ProjectSelection';

describe('<ProjectSelection>', () => {
	it('mounts', () => {
		cy.mount(<ProjectSelection />);
	});

	describe('inputs', () => {
		beforeEach(() => {
			cy.mount(<ProjectSelection />);
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
		const projectId = '123';

		cy.mountWithStore(<ProjectSelection />, store);

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('projectId').type(projectId);
		cy.getBySel('submit').click();

		//? to be or to have been?
		expect('@dispatch').to.be.calledWith(setProjectId(projectId));
	});

	describe('with project data', () => {
		beforeEach(() => {
			const cbAddress = 'https://fake.codebeamer.com/cb';
			const credentials = { username: 'anon', password: 'pass' };

			const store = getStore();

			store.dispatch(setCredentials(credentials));
			store.dispatch(setCbAddress(cbAddress));

			cy.intercept(`${cbAddress}/api/v3/projects`, {
				fixture: 'projects.json',
			});
		});

		it('shows loaded projects as options in the respective dropdown', () => {
			//Melon is the name of a project in the fixture
			cy.getBySel('project').should('contain.text', 'Melon');
		});

		it('selects a project in the dropdown based on the entered project Id', () => {
			cy.getBySel('projectId').type('3');
			cy.get('[data-test="project"] option:selected').should(
				'have.text',
				'Kiwi'
			);
		});

		it('enters the project Id into its input when selecting a project from the dropdown', () => {
			cy.getBySel('project').select('Cherry');
			//? not sure, but this might need to go into a then() call
			cy.getBySel('projectId').should('have.value', '4');
		});

		it('shows an error message if there is no project for an entered Id', () => {
			cy.getBySel('projectId').type('8');
			cy.getBySel('projectIdErrors').should('exist');
		});
	});
});
