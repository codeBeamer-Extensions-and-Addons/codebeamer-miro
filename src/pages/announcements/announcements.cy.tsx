import * as React from 'react';
import Announcements from './Announcements';

describe('<Announcements>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Announcements />);
	});

	it('displays when a user has previously used the app', () => {});

	it('does not display to entirely new users', () => {});

	it('does have a button to close it with', () => {});
});
