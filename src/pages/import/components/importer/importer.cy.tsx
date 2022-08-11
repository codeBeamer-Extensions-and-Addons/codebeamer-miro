import * as React from 'react';
import Importer from './importer';

describe('<Importer>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Importer items={[]} />);
	});
});
