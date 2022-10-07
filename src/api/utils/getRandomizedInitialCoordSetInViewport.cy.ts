import { Rect } from '@mirohq/websdk-types';
import getRandomizedCoordSetInViewport from './getRandomizedCoordSetInViewPort';

//* Skipped for now.
describe.skip('getRandomizedInitialCoordSetInViewport', () => {
	const viewport: Rect = {
		x: 500,
		width: 1000,
		y: 500,
		height: 600,
	};
	beforeEach(() => {
		cy.stub(miro.board.viewport, 'get').returns(viewport);
	});
});
