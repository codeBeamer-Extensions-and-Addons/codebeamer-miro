import * as React from 'react';
import { setCbqlString } from '../../../../../store/slices/userSettingsSlice';
import { getStore, store } from '../../../../../store/store';
import CbqlInput from './CbqlInput';

const cbqlInputSelector = 'cbql';
const submitSelector = 'submit';

describe('<CbqlInput>', () => {
	it('mounts', () => {
		cy.mountWithStore(<CbqlInput />);
	});

	it('has a text-input for the CBQL string', () => {
		cy.mountWithStore(<CbqlInput />);

		cy.getBySel(cbqlInputSelector).should('exist');
	});

	it('shows the cached CBQL string when there is one', () => {
		const store = getStore();
		const expectedString = 'tracker.id in 8023';
		store.dispatch(setCbqlString(expectedString));

		cy.mountWithStore(<CbqlInput />, { reduxStore: store });

		cy.getBySel(cbqlInputSelector).should('have.value', expectedString);
	});

	//TODO can't figure this out. cypress claims dispatch ain't ever called
	//TODO but the log right before it is visible in-console and, manually testing, it clearly does call
	it.skip('updates the CBQL string in store when submitting', () => {
		cy.mountWithStore(<CbqlInput />);

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel(cbqlInputSelector).type('tracker.id = 503');
		cy.getBySel(submitSelector).click();

		cy.get('@dispatch').then((dispatch) =>
			expect(dispatch).to.have.been.calledWith(
				setCbqlString('tracker.id = 503')
			)
		);
	});

	afterEach(() => {
		localStorage.clear();
	});
});
