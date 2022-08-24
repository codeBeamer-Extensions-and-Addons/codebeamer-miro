import * as React from 'react';
import {
	setCbAddress,
	setProjectId,
} from '../../store/slices/boardSettingsSlice';
import {
	setCredentials,
	setTrackerId,
} from '../../store/slices/userSettingsSlice';
import { getStore } from '../../store/store';
import Auth from './auth';

describe('<Auth>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Auth />);
	});

	describe('form elements', () => {
		beforeEach(() => {
			cy.mountWithStore(<Auth />);
		});

		it('has an input for the CodeBeamer Address', () => {
			cy.getBySel('cbAddress').type('address');
		});
		it('has an input for the CodeBeamer Username', () => {
			cy.getBySel('cbUsername').type('user');
		});
		it('has an input for the CodeBeamer Password', () => {
			cy.getBySel('cbPassword').type('pass');
		});
		it('has a button to connect with', () => {
			cy.getBySel('submit');
		});
	});

	it('saves values in store when submitting the form', () => {
		const store = getStore();
		const cbAddress = 'https://codebeamer.com/cb';
		const username = 'user';
		const password = 'pass';

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('cbAddress').type(cbAddress);
		cy.getBySel('cbUsername').type(username);
		cy.getBySel('cbPassword').type(password);

		cy.getBySel('submit').click();

		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.be.calledWith(
				setCredentials({ username: username, password: password })
			);
			expect(dispatch).to.be.calledWith(setCbAddress(cbAddress));
		});
	});

	it('resets the stored project- and trackerId when updating the cbAddress', () => {
		const store = getStore();
		const cbAddress = 'https://codebeamer.com/cb';
		const username = 'user';
		const password = 'pass';

		const projectId = '';
		const trackerId = '';

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('cbAddress').type(cbAddress);

		//* need to fill these in or else the submit is disabled
		cy.getBySel('cbUsername').type(username);
		cy.getBySel('cbPassword').type(password);

		cy.getBySel('submit').click();

		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.have.been.calledWith(setCbAddress(cbAddress));
			expect(dispatch).to.have.been.calledWith(setProjectId(projectId));
			expect(dispatch).to.have.been.calledWith(setTrackerId(trackerId));
		});
	});

	it('does not reset the stored project- and trackerId when only updating name and/or password', () => {
		const store = getStore();
		const cbAddress = 'https://codebeamer.com/cb';
		const username = 'user';
		const password = 'pass';

		const newUsername = 'userinho';
		const newPassword = 'passinho';

		const projectId = '';
		const trackerId = '';

		store.dispatch(setCbAddress(cbAddress));
		store.dispatch(
			setCredentials({ username: username, password: password })
		);

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('cbUsername').clear().type(newUsername);
		cy.getBySel('cbPassword').clear().type(newPassword);

		cy.getBySel('submit').click();

		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.have.been.calledWith(
				setCredentials({ username: newUsername, password: newPassword })
			);
			expect(dispatch).not.to.have.been.calledWith(
				setProjectId(projectId)
			);
			expect(dispatch).not.to.have.been.calledWith(
				setTrackerId(trackerId)
			);
		});
	});

	describe('input validation', () => {
		//not going into all the details here, since it's just nice to have
		beforeEach(() => {
			cy.mountWithStore(<Auth />);
		});

		it('shows an error when entering an invalid codebeamer address', () => {
			cy.getBySel('cbAddress').type('tcp:/my.cb.io{enter}');

			cy.getBySel('cbAddressErrors').should('exist');
		});

		it('shows (an) error(s) when submitting without having filled all inputs', () => {
			cy.getBySel('submit').click();

			cy.get('.status-text');
		});
	});

	it('loads cached values into the form', () => {
		const cbAddress = 'https://retina.roche.com/cb';
		const username = 'anon';
		const password = 'pass';

		const store = getStore();
		//"cache" is mocked by manually loading the values into store
		store.dispatch(setCbAddress(cbAddress));
		store.dispatch(
			setCredentials({ username: username, password: password })
		);

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.getBySel('cbAddress').should('have.value', cbAddress);
		cy.getBySel('cbUsername').should('have.value', username);
		cy.getBySel('cbPassword').should('have.value', password);
	});

	it.skip('communicates the user the success of the operation when the credentials / server address was updated', () => {
		//* note that it really only does reflect success of updating these values in-store.
		//* it mocks communicating successful
		const projectId = '2';
		cy.mountWithStore(<ProjectSelection />);

		// cy.getBySel(projectIdSelector).type(projectId);
		// cy.getBySel(submitSelector)
		// 	.click()
		// 	.then(() => {
		// 		cy.getBySel(userFeedbackWrapperSelector).should('exist');
		// 		cy.getBySel(submitSelector).should('not.exist');
		// 	});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
