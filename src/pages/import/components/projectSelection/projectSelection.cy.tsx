import * as React from 'react';
import {
	setCbAddress,
	setProjectId,
} from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import ProjectSelection from './ProjectSelection';

const projectSelector = '.select__control';
const projectsSelector = '.select__menu';
const submitSelector = 'submit';
const currentProjectSelector = 'current-project';
const userFeedbackWrapperSelector = 'user-feedback';
const cbContextSelector = 'cb-context';

describe('<ProjectSelection>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ProjectSelection />);
	});

	context('inputs', () => {
		beforeEach(() => {
			cy.mountWithStore(<ProjectSelection />);
		});

		it('has a project select', () => {
			cy.get(projectSelector).should('exist');
		});
		it('has a submit button', () => {
			cy.getBySel(submitSelector);
		});
	});

	it('displays the cached cbAddress for context', () => {
		const store = getStore();
		const context = 'https://codebeamer.com/cb';
		store.dispatch(setCbAddress(context));

		cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

		cy.getBySel(cbContextSelector).should('contain.text', context);
	});

	context('with project data', () => {
		beforeEach(() => {
			cy.intercept('GET', `**/api/v3/projects`, {
				fixture: 'projects.json',
			}).as('projectsQuery');
		});

		it('displays the currently selected project', () => {
			const store = getStore();
			const project = { id: 1, name: 'Banana' };
			store.dispatch(setProjectId(project.id));

			cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

			cy.getBySel(currentProjectSelector).should(
				'contain.text',
				project.name
			);
		});

		it('saves the projectId in store when submitting the form', () => {
			const store = getStore();
			const project = { id: 1, name: 'Banana' };

			cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

			cy.spy(store, 'dispatch').as('dispatch');

			cy.get(projectSelector).type(`${project.name}{enter}`);
			cy.getBySel(submitSelector).click();

			cy.get('@dispatch').then((dispatch) =>
				expect(dispatch).to.have.been.calledWith(
					setProjectId(project.id)
				)
			);
		});

		it('resets the trackerId when a projectId change is submitted', () => {
			const store = getStore();
			const trackerId = '';

			cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

			cy.spy(store, 'dispatch').as('dispatch');

			cy.get(projectSelector).type('Banana{enter}');
			cy.getBySel(submitSelector).click();

			cy.get('@dispatch').then((dispatch) =>
				expect(dispatch).to.have.been.calledWith(
					setTrackerId(trackerId)
				)
			);
		});

		it('shows loaded projects as options in the respective dropdown', () => {
			cy.mountWithStore(<ProjectSelection />);
			cy.get(projectSelector).click();
			//Melon is the name of a project in the fixture
			cy.get(projectsSelector).should('contain.text', 'Melon');
		});

		it('communicates the user the success of the operation when the projectId was updated', () => {
			cy.mountWithStore(<ProjectSelection />);

			cy.get(projectSelector).type('Banana{enter}');
			cy.getBySel(submitSelector)
				.click()
				.then(() => {
					cy.getBySel(userFeedbackWrapperSelector).should('exist');
					cy.getBySel(submitSelector).should('not.exist');
				});
		});

		it('re-queries Projects when the stored cbAddress value changes', () => {
			const store = getStore();
			const cbAddress = 'https://fake.codebeamer.com';

			cy.intercept('GET', `https://fake.codebeamer.com/api/v3/projects`, {
				fixture: 'projects.json',
			}).as('lazyQuery');

			cy.mountWithStore(<ProjectSelection />, { reduxStore: store });

			store.dispatch(setCbAddress(cbAddress));

			cy.wait('@lazyQuery');
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
