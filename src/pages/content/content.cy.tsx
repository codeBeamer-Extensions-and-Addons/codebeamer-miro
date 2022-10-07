import { setProjectId } from '../../store/slices/boardSettingsSlice';
import {
	setCredentials,
	setShowAnnouncements,
} from '../../store/slices/userSettingsSlice';
import { getStore } from '../../store/store';
import Content from './Content';
import * as React from 'react';

describe('<Content>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Content />);
	});

	it('defaults to showing the Auth form', () => {
		cy.mountWithStore(<Content />);

		cy.getBySel('auth').should('exist');
	});

	it('displays the announcements page when a user has previously used the app but not seen the announcement', () => {
		const store = getStore();
		store.dispatch(
			setCredentials({ username: 'teste', password: 'rinho' })
		);

		cy.mountWithStore(<Content />, { reduxStore: store });

		cy.getBySel('announcements').should('exist');
	});

	it('does not display the nnouncements page to entirely new users', () => {
		cy.mountWithStore(<Content />);

		cy.getBySel('announcements').should('not.exist');
	});

	describe('uses cached values to automate procedures', () => {
		const username = 'anon';
		const password = '123';

		beforeEach(() => {
			cy.intercept('GET', `**/api/v3/users/findByName*`, {
				statusCode: 200,
			}).as('auth');
		});

		it('checks whether it can connect to the cached codeBeamer instance when opened', () => {
			const store = getStore();
			store.dispatch(
				setCredentials({ username: username, password: password })
			);

			cy.mountWithStore(<Content />, { reduxStore: store });

			cy.wait('@auth');
		});

		it('proceeds to the project selection when authenticated successfully', () => {
			const store = getStore();
			store.dispatch(
				setCredentials({ username: username, password: password })
			);
			store.dispatch(setShowAnnouncements(false));

			cy.mountWithStore(<Content />, { reduxStore: store });

			cy.getBySel('project-selection').should('exist');
		});

		it('proceeds to the import component when authenticated & a project is already selected', () => {
			const store = getStore();
			store.dispatch(
				setCredentials({ username: username, password: password })
			);
			store.dispatch(setShowAnnouncements(false));
			store.dispatch(setProjectId(1));

			cy.mountWithStore(<Content />, { reduxStore: store });

			cy.getBySel('import').should('exist');
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
