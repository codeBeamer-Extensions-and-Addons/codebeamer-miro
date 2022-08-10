import { setCbAddress, setProjectId } from '../store/slices/boardSettingsSlice';
import { setCredentials } from '../store/slices/userSettingsSlice';
import { getStore } from '../store/store';
import Content from './content';
import * as React from 'react';

describe('<Content>', () => {
	it('mounts', () => {
		cy.mount(<Content />);
	});

	it('defaults to showing the Auth form', () => {
		cy.mountWithStore(<Content />);

		cy.getBySel('auth').should('exist');
	});

	describe('uses cached values to automate procedures', () => {
		let cbAddress: string;
		let store: any;

		beforeEach(() => {
			cbAddress = 'https://test.codebeamer.com/cb';
			const username = 'anon';

			//! ?
			store = getStore();
			store.dispatch(setCbAddress(cbAddress));
			store.dispatch(
				setCredentials({ username: username, password: '123' })
			);

			//! not sure whether the following tests really have the reference
			cy.intercept('GET', `${cbAddress}/api/v3/users/findByName*`, {
				statusCode: 200,
			}).as('auth');
		});

		it('checks whether it can connect to the cached codeBeamer instance when opened', () => {
			cy.mountWithStore(<Content />, { reduxStore: store });

			cy.wait('@auth');
		});

		it('proceeds to the project selection when authenticated successfully', () => {
			cy.mountWithStore(<Content />, store);

			cy.getBySel('project-selection').should('exist');
		});

		it.skip('proceeds to the import component when authenticated & a project is already selected', () => {
			store.dispatch(setProjectId(1));

			cy.mountWithStore(<Content />, store);

			cy.getBySel('import').should('exist');
		});
	});
});
