import * as React from 'react';
import CbqlInput from './CbqlInput';

describe('<CbqlInput>', () => {
	it('mounts', () => {
		cy.mountWithStore(<CbqlInput />);
	});
});
