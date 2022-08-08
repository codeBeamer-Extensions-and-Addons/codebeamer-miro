import Auth from './auth';

describe('<Auth>', () => {
	cy.stub(miro.board, 'getAppData').returns({
		cbAddress: 'https://retina.roche.com',
	});

	it('mounts', () => {
		cy.mount(<Auth loading={false} error={{}} />);
	});
});
