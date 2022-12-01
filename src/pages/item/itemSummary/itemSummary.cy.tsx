import * as React from 'react';
import { CodeBeamerItem } from '../../../models/codebeamer-item.if';
import { setCbAddress } from '../../../store/slices/boardSettingsSlice';
import { getStore } from '../../../store/store';
import ItemSummary from './ItemSummary';

const mockItem: Partial<CodeBeamerItem> = {
	name: 'Mock the ITem',
	id: 52342,
	description: 'Lorem ipsum doler set amur and so on',
};

const mockCardId = '329329';

const summarySelector = 'summary-summary';
const zoomSelector = 'summary-zoom-to-item';
const descriptionSelector = 'summary-description';

describe('<ItemSummary>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ItemSummary item={mockItem} />);
	});

	describe('item values', () => {
		beforeEach(() => {
			cy.mountWithStore(<ItemSummary item={mockItem} />);
		});

		it('displays the item its name', () => {
			cy.getBySel(summarySelector)
				.should('exist')
				.and('contain.text', mockItem.name);
		});

		it('displays the item its description', () => {
			cy.getBySel(descriptionSelector)
				.should('exist')
				.and('contain.text', mockItem.description);
		});
	});
	it('converts the item its description from wiki to html', () => {
		const store = getStore();
		const mockAddress = 'https://mock.cb.com/cb';
		store.dispatch(setCbAddress(mockAddress));
		cy.intercept('POST', `**/wiki2html`, { statusCode: 200 }).as(
			'wiki2html'
		);

		cy.mountWithStore(<ItemSummary item={mockItem} />, {
			reduxStore: store,
		});

		cy.wait('@wiki2html')
			.its('request.body')
			.should('equal', mockItem.description);
	});
	describe('zoom to item button', () => {
		it('displays the zoom-to-item button if a card id is provided', () => {
			cy.mountWithStore(
				<ItemSummary item={mockItem} cardId={mockCardId} />
			);

			cy.getBySel(zoomSelector).should('exist');
		});
		it('zooms to the item on the board when clicked', () => {
			const mockWidget = { name: 'mockeridoo', id: mockCardId };

			cy.stub(miro.board, 'getById').returns(mockWidget);
			cy.spy(miro.board.viewport, 'zoomTo').as('zoomToItem');

			cy.mountWithStore(
				<ItemSummary item={mockItem} cardId={mockCardId} />
			);

			cy.getBySel(zoomSelector).should('exist');

			cy.getBySel(zoomSelector)
				.click()
				.then(() => {
					cy.get('@zoomToItem').then((spy) => {
						expect(spy).to.be.calledWith(mockWidget);
					});
				});
		});
	});
});
