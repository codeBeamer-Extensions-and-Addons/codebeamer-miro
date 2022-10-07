import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Importer from './Importer';

describe('<Importer>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Importer items={[]} />);
	});

	it('does not show a close button by default', () => {
		cy.mountWithStore(<Importer items={[]} />);

		cy.get('[aria-label="close"]').should('not.exist');
	});

	it('does show a close button if passed an onClose prop', () => {
		const handler = cy.spy();
		cy.mountWithStore(<Importer items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').should('exist');
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<Importer items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});

	it('fetches the details of the items passed as props', () => {
		const items: string[] = ['1', '2', '3'];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (1,2,3)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	it('fetches the details of all items in the selected tracker (without any additional filter criteria) when passing an empty array as prop', () => {
		const items: string[] = [];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	describe('import progress bar', () => {
		const progressBarSelector = 'importProgress';

		it('shows the total amount of items to import based on the passed items array', () => {
			const items: string[] = ['1', '2', '3'];
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(<Importer items={items} />);

			cy.getBySel(progressBarSelector).should(
				'contain.text',
				`/${items.length}`
			);
		});

		/**
		 * Because importing all is communicated with an empty array, its length doesn't serve as measure in this case
		 */
		it('shows the total amount of items to import based on a fallback value when importing all items for a query', () => {
			const items: string[] = [];
			const totalItems = 235;
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(
				<Importer items={items} totalItems={totalItems} />
			);

			cy.getBySel(progressBarSelector).should(
				'contain.text',
				`/${totalItems}`
			);
		});
	});
});
