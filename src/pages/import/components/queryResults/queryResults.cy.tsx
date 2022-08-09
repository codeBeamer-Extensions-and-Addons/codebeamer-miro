import { setCbAddress } from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import QueryResults from './QueryResults';

describe('<QueryResults>', () => {
	it('mounts', () => {
		cy.mount(<QueryResults />);
	});

	it('queries items with the cached cbqlString when mounted', () => {
		const store = getStore();
		const cbAddress = 'https://fake.codebeamer.com/cb';
		const trackerId = '123';
		const queryString = `tracker.id in (${trackerId})`;
		//the cbqlString value in the store is set indirectly whenever value that it depends on change
		store.dispatch(setTrackerId(trackerId));
		store.dispatch(setCbAddress(cbAddress));

		cy.intercept('POST', `${cbAddress}/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, store);

		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', queryString);
	});
});
