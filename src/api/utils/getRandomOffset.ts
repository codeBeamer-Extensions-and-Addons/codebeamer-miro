/**
 * Returns a (pseudo-) random offset, between +- max and zero or min, if specified.
 * @param max Max offset
 * @param min Min offset (defaults to 0)
 * @returns
 */
export default function getRandomOffset(max: number, min: number = 0): number {
	return (Math.random() > 0.5 ? 1 : -1) * (Math.random() * (max - min) + min);
}
