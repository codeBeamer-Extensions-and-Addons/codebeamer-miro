import * as React from 'react';
import ZoomToItemButton from './ZoomToItemButton';

const zoomSelector = 'zoom-to-item';
const mockCardId = '329329';

describe('<ZoomToItemButton>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ZoomToItemButton cardId={mockCardId} />);
	});

	it('displays the zoom-to-item button if a card id is provided', () => {
		cy.mountWithStore(<ZoomToItemButton cardId={mockCardId} />);

		cy.getBySel(zoomSelector).should('exist');
	});

	it('displays nothing if no card id is provided', () => {
		cy.mountWithStore(<ZoomToItemButton cardId={''} />);

		cy.getBySel(zoomSelector).should('not.exist');
	});

	it('zooms to the item on the board when clicked', () => {
		const mockWidget = { name: 'mockeridoo', id: mockCardId };

		cy.stub(miro.board, 'getById').returns(mockWidget);
		cy.spy(miro.board.viewport, 'zoomTo').as('zoomToItem');

		cy.mountWithStore(<ZoomToItemButton cardId={mockCardId} />);

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
