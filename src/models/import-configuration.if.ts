/**
 * Defines the representation of the appCardTagSettings..
 * Currently only holds information about what properties to synchronize.
 */
export interface IAppCardTagSettings {
	standard: Record<string, boolean>;
	trackerSpecific?: Record<string, boolean>[];
}

/**
 * Defines the structure of a single appCardTagSetting
 */
export interface IAppCardTagSetting {
	property: string;
	value: boolean;
}
