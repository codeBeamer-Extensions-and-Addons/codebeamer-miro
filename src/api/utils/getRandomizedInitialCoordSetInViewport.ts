/**
 * Creates an x-y coord pair with a distribution centered around the current viewport's center
 * with a maximum offset of a third of the viewport.
 * @returns object with x and y values
 */
export default async function getRandomizedInitialCoordSetInViewport(): Promise<{
	x: number;
	y: number;
}> {
	const viewport = await miro.board.viewport.get();
	let randomYOffset = (Math.random() * viewport.height) / 3;
	let randomXOffset = (Math.random() * viewport.width) / 3;
	const y = viewport.y + viewport.height / 2 + randomYOffset;
	const x = viewport.x + viewport.width / 2 + randomXOffset;

	return { x: x, y: y };
}
