import { Rect } from '@mirohq/websdk-types';
import {
	DEFAULT_ORIGINS_PER_RADIUS,
	RADIUS_INCREMENT,
	MAX_OFFSET_TO_SUBJECT_ORIGIN,
} from '../../constants/coordinate-calculation';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import ItemDetails from '../../pages/item/itemDetails';
import getRandomOffset from './getRandomOffset';

var subjectOrigins: { subject: string; x: number; y: number }[] = [];
var currentViewPort: Rect;
var circleXCenter: number;
var circleYCenter: number;

let itemIndex = 1;
let radiusIndex = 1;

/**
 * Calculates the allowed number of origins for the current radius increment
 * @param radiusIndex The current radius index
 * @returns Number of allowed origins for this radius.
 */
function getAllowedNoOfOriginsForRadius(radiusIndex: number) {
	return DEFAULT_ORIGINS_PER_RADIUS * radiusIndex;
}

/**
 * Creates coordinates that makes Items spawn grouped by their subjects in concentric circles.
 * <p>
 * Items without a subject are put into the circle's center. For each subject thereafter, an origin
 * coordinate set is created in concentric circles. The first circle has {@link DEFAULT_ORIGINS_PER_RADIUS} subjects,
 * the others {radiusIndex * the Default origins}.
 * </p>
 * <p>
 * Distribution and therefore clarity are heavily impacted by the values of
 * {@link DEFAULT_ORIGINS_PER_RADIUS}, {@link RADIUS_INCREMENT} and {@link MAX_OFFSET_TO_SUBJECT_ORIGIN}
 * </p>
 * @param item
 * @returns An {x,y} coordinate set that groups the Item with others of the same subject.
 */
export default async function getConcentricCircleCoords(
	item: CodeBeamerItem
): Promise<{ x: number; y: number }> {
	//* initialize var
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

	let itemSubject =
		item.subjects && item.subjects.length ? item.subjects[0].name : 'none';
	let subjectOrigin = subjectOrigins.find(
		(so) => so.subject == itemSubject || so.subject == item.name
	);

	if (!subjectOrigin) {
		let index = itemIndex++;
		let x =
			circleXCenter +
			Math.cos(getAngle(index, radiusIndex)) *
				(RADIUS_INCREMENT * radiusIndex);
		let y =
			circleYCenter +
			Math.sin(getAngle(index, radiusIndex)) *
				(RADIUS_INCREMENT * radiusIndex);
		subjectOrigin = { subject: itemSubject, x: x, y: y };
		subjectOrigins.push(subjectOrigin);
		if (index / getAllowedNoOfOriginsForRadius(radiusIndex) >= 1) {
			itemIndex = 1;
			radiusIndex++;
		}
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
