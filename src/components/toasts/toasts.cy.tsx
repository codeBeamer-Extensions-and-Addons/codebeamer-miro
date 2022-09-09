import * as React from 'react';
import Toasts from './Toasts';

describe('<Toasts>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Toasts />);
	});

	it('displays toasts for the messages in store');

	it('displays toasts with their defined background color');

	it('removes a toast after the default delay');

	it('removes a toast when its close button is clicked');
});
