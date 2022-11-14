/**
 * Notworthy properties of an entry in a Tracker's schema array
 */
export interface CodeBeamerTrackerSchemaEntry {
	id: number;
	name: string;
	legacyRestName: string;
	trackerItemField: string;
	multipleValues: boolean;
}
