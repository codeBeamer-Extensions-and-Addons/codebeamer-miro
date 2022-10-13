import * as React from 'react';
import Import from './Import';

describe('<Import>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Import />);
	});
});
