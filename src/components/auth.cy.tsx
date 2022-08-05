import Auth from './auth';

describe('<Auth>', () => {
	it('mounts', () => {
		cy.mount(<Auth loading={false} error={{}} />);
	});
});
