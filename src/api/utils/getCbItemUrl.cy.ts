import getCbItemUrl from './getCbItemUrl';
import { store } from '../../store/store';

//not really a component test, but cypress can do unit testing, so I might as well
describe('getCbItemUrl', () => {
	it('returns an url made from the currently stored cbAddress and the item its specific path', () => {
		const testCbAddress = 'https://cb.com/cb';
		const testItemId = '53';
		const expectedUrl = `${testCbAddress}/issue/${testItemId}`;
		cy.stub(store, 'getState').returns({
			boardSettings: { cbAddress: testCbAddress },
		});

		const itemUrl = getCbItemUrl(testItemId);

		expect(itemUrl).to.equal(expectedUrl);
	});
});
