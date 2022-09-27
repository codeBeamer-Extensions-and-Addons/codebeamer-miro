/**
 * Creates an x-y coord pair within the current viewport.
 * @returns object with x and y values
 */
export default async function getRandomizedCoordSetInViewport(): Promise<{
	x: number;
	y: number;
}> {
	const viewport = await miro.board.viewport.get(); // top-left corner of viewport
	let randomYOffset = Math.random() * viewport.height;
	let randomXOffset = Math.random() * viewport.width;
	const y = viewport.y + randomYOffset;
	const x = viewport.x + randomXOffset;

	return { x: x, y: y };
}
