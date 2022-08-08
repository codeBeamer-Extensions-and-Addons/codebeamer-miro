import Auth from './auth';

describe('<Auth>', () => {
	it('mounts', () => {
		cy.mount(<Auth loading={false} error={{}} />);
	});

	it.skip('loads cached values into the form', () => {
		cy.stub(miro.board, 'getAppData').returns({
			cbAddress: 'https://retina.roche.com',
		});
		//TODO fill/stub localstorage
	});

	it('validates the cb address before attempting auth');
	it('does not attempt auth when values are missing');
	it('saves the credentials when clicking the "Connect" button');
});
