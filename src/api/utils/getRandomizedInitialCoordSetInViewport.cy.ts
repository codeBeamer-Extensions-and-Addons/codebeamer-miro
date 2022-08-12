import { Rect } from '@mirohq/websdk-types';
import getRandomizedInitialCoordSetInViewport from './getRandomizedInitialCoordSetInViewport';

describe('getRandomizedInitialCoordSetInViewport', () => {
	const viewport: Rect = {
		x: 500,
		width: 1000,
		y: 500,
		height: 600,
	};
	beforeEach(() => {
		cy.stub(miro.board.viewport, 'get').returns(viewport);
	});
	it('returns a y coord which is within a third of the viewport its height its center', async () => {
		const coords = await getRandomizedInitialCoordSetInViewport();
		console.log(coords);
		expect(coords.y - (viewport.y + viewport.height) <= viewport.height / 3)
			.to.be.true;
	});

	it('returns an x coord which is within a third of the viewport its width its center', async () => {
		const coords = await getRandomizedInitialCoordSetInViewport();
		console.log(coords);
		expect(
			coords.x - (viewport.x + viewport.width / 2) <= viewport.width / 3
		).to.be.true;
	});
});
