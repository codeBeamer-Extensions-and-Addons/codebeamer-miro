import { setCbAddress } from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Query from './Query';

describe('<Query>', () => {
	it('mounts', () => {
		cy.mount(<Query />);
	});

	describe('inputs', () => {
		beforeEach(() => {
			cy.mount(<Query />);
		});

		it('has a select to choose trackers from', () => {
			cy.getBySel('trackerSelect');
		});
	});

	describe('tracker select', () => {
		beforeEach(() => {
			const store = getStore();
			const cbAddress = 'https://fake.codebeamer.com/cb';
			store.dispatch(setCbAddress(cbAddress));

			cy.intercept(`${cbAddress}/projects/**/trackers`, {
				fixture: 'trackers.json',
			});

			cy.mountWithStore(<Query />, store);
		});

		it('displays the project its trackers in the select', () => {
			cy.getBySel('trackerSelect')
				.find('option')
				.should('contain.text', 'Features')
				.and('contain.text', 'PBI');
		});

		it('updates the selected Tracker in the store', () => {
			const store = getStore();

			cy.mountWithStore(<Query />, store);

			cy.spy(store, 'dispatch').as('dispatch');

			cy.getBySel('trackerSelect').select('PBI');

			expect('@dispatch').to.have.been.calledWith(setTrackerId('5'));
		});
	});
});
