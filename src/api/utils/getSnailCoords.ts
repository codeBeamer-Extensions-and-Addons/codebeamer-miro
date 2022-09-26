import { Rect } from '@mirohq/websdk-types';
import {
	DEFAULT_ORIGINS_PER_RADIUS,
	RADIUS_INCREMENT,
	MAX_OFFSET_TO_SUBJECT_ORIGIN,
} from '../../constants/coordinate-calculation';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import getRandomOffset from './getRandomOffset';

var subjectOrigins: { subject: string; x: number; y: number }[] = [];
var currentViewPort: Rect;
var circleXCenter: number;
var circleYCenter: number;

let itemIndex = 1;

/**
 * Calculates the allowed number of origins for the current radius increment
 * @param radiusIndex The current radius index
 * @returns Number of allowed origins for this radius.
 */
function getAllowedNoOfOriginsForRadius(radiusIndex: number) {
	return DEFAULT_ORIGINS_PER_RADIUS * radiusIndex;
}

/**
 * Creates coordinates that makes Items spawn grouped by their subjects in a snail shape
 * <p>
 * Items without a subject are put into the shell's center. For each subject thereafter, an origin
 * coordinate set is created in demi-circles, making for a snail-like shape inititally, but probably ending up more as a
 * vortex / black hole.
 * . All demi-circles have up to {@link DEFAULT_ORIGINS_PER_RADIUS} subject origins.
 * </p>
 * <p>
 * Distribution and therefore clarity are heavily impacted by the values of
 * {@link DEFAULT_ORIGINS_PER_RADIUS}, {@link RADIUS_INCREMENT} and {@link MAX_OFFSET_TO_SUBJECT_ORIGIN}
 * </p>
 * @param item
 * @returns An {x,y} coordinate set that groups the Item with others of the same subject.
 */
export default async function getSnailCoordSetPerSubject(
	item: CodeBeamerItem
): Promise<{ x: number; y: number }> {
	//* just do it once
	if (!currentViewPort) currentViewPort = await miro.board.viewport.get();
	//* initialize default subject
	if (!subjectOrigins.length) {
		circleXCenter = currentViewPort.x + currentViewPort.width / 2;
		circleYCenter = currentViewPort.y + currentViewPort.height / 2;
		subjectOrigins.push({
			subject: 'none',
			x: circleXCenter,
			y: circleYCenter,
		});
	}

	let itemSubject = item.subjects[0]?.name ?? 'none';
	let subjectOrigin = subjectOrigins.find((so) => so.subject == itemSubject);

	if (!subjectOrigin) {
		let index = itemIndex++;
		let radiusIndex = Math.ceil(index / DEFAULT_ORIGINS_PER_RADIUS);
		let x =
			circleXCenter +
			Math.cos(2 * getAngle(index, radiusIndex)) *
				(RADIUS_INCREMENT * radiusIndex);
		let y =
			circleYCenter +
			Math.sin(getAngle(index, radiusIndex)) *
				(RADIUS_INCREMENT * radiusIndex);
		subjectOrigin = { subject: itemSubject, x: x, y: y };
		subjectOrigins.push(subjectOrigin);
	}

	return {
		x: subjectOrigin.x + getRandomOffset(MAX_OFFSET_TO_SUBJECT_ORIGIN),
		y: subjectOrigin.y + getRandomOffset(MAX_OFFSET_TO_SUBJECT_ORIGIN),
	};
}

function getAngle(index: number, radiusIndex: number): number {
	return (
		2 *
		Math.PI *
		((index -
			(radiusIndex -
				1 * getAllowedNoOfOriginsForRadius(radiusIndex - 1))) /
			getAllowedNoOfOriginsForRadius(radiusIndex))
	);
}
