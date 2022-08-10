import * as React from 'react';
import { setCbAddress } from '../../store/slices/boardSettingsSlice';
import { setCredentials } from '../../store/slices/userSettingsSlice';
import { getStore } from '../../store/store';
import Auth from './auth';

describe('<Auth>', () => {
	it('mounts', () => {
		cy.mount(<Auth />);
	});

	describe('form elements', () => {
		beforeEach(() => {
			cy.mount(<Auth />);
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

	it.only('saves values in store when submitting the form', () => {
		const store = getStore();

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('cbAddress').type('https://codebeamer.com/cb');
		cy.getBySel('cbUsername').type('user');
		cy.getBySel('cbPassword').type('pass');

		cy.getBySel('submit').click();

		//? no idea whether this works
		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.be.calledWith(
				setCredentials({ username: 'user', password: 'pass' })
			);
			expect(dispatch).to.be.calledWith(setCbAddress('address'));
		});
	});

	describe('input validation', () => {
		//not going into all the details here, since it's just nice to have
		beforeEach(() => {
			cy.mount(<Auth />);
		});

		it('shows an error when entering an invalid codebeamer address', () => {
			cy.getBySel('cbAddress').type('tcp:/my.cb.io');

			cy.getBySel('cbAddressErrors').should('exist');
		});

		it('shows (an) error(s) when submitting without having filled all inputs', () => {
			cy.getBySel('submit').click();

			cy.get('status-text');
		});
	});

	it('loads cached values into the form', () => {
		const cbAddress = 'https://retina.roche.com';
		const username = 'anon';
		const password = 'pass';

		cy.stub(miro.board, 'getAppData').returns({
			cbAddress: cbAddress,
		});

		const store = getStore();

		store.dispatch(
			setCredentials({ username: username, password: password })
		);

		cy.mountWithStore(<Auth />, { reduxStore: store });

		//! not sure whether the async Loading function for the board settings is done by now
		cy.getBySel('cbAddress').should('have.text', cbAddress);
		cy.getBySel('cbUsername').should('have.text', username);
		cy.getBySel('cbPassword').should('have.text', password);
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
