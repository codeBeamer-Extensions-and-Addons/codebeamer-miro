import * as React from 'react';
import Query from './Query';

describe('<Query>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Query />);
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
