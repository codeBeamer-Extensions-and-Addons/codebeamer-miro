import * as React from 'react';
import { AppCardToItemMapping } from '../../../../models/appCardToItemMapping.if';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Updater from './Updater';

describe('<Updater>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Updater items={[]} />);
	});

	it('does not show a close button by default', () => {
		cy.mountWithStore(<Updater items={[]} />);

		cy.get('[aria-label="close"]').should('not.exist');
	});

	it('does show a close button if passed an onClose prop', () => {
		const handler = cy.spy();
		cy.mountWithStore(<Updater items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').should('exist');
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<Updater items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});

	it('fetches the details of the items passed as props', () => {
		const items: AppCardToItemMapping[] = [
			{ itemId: '1', appCardId: '' },
			{ itemId: '2', appCardId: '' },
			{ itemId: '3', appCardId: '' },
		];
		const store = getStore();

		const expectedQuery = `item.id IN (1,2,3)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Updater items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	describe('import progress bar', () => {
		const progressBarSelector = 'importProgress';

		it('shows the total amount of items to import based on the passed items array', () => {
			const items: AppCardToItemMapping[] = [
				{ itemId: '1', appCardId: '' },
				{ itemId: '2', appCardId: '' },
				{ itemId: '3', appCardId: '' },
			];
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(<Updater items={items} />);

			cy.getBySel(progressBarSelector).should(
				'contain.text',
				`/${items.length}`
			);
		});
	});
});
