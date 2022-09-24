import { MAX_OFFSET_TO_SUBJECT_ORIGIN } from '../../constants/coordinate-calculation';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import getRandomizedCoordSetInViewport from './getRandomizedCoordSetInViewPort';
import getRandomOffset from './getRandomOffset';

/**
 * Maps subjects to a certain set of coordinates to spawn child items around.
 */
var subjectOriginsMap: Map<string, { x: number; y: number }> = new Map<
	string,
	{ x: number; y: number }
>();

export default async function getRandomCoordSetPerSubject(
	item: CodeBeamerItem
): Promise<{ x: number; y: number }> {
	let mainSubject: string = 'default';
	try {
		mainSubject = item.subjects[0].name;
	} catch (error) {}

	let origin = subjectOriginsMap.get(mainSubject);
	if (!origin) {
		origin = await getRandomizedCoordSetInViewport();
		subjectOriginsMap.set(mainSubject, origin);
	}
	let xOffset = getRandomOffset(MAX_OFFSET_TO_SUBJECT_ORIGIN);
	let yOffset = getRandomOffset(MAX_OFFSET_TO_SUBJECT_ORIGIN);

	console.log(subjectOriginsMap);
	return { x: origin.x + xOffset, y: origin.y + yOffset };
}
