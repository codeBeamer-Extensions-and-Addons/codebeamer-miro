/**
 * Max offset in either coord direction an item should have to its subject.
 * <p>
 * Unit is device-independent pixels.
 * </p>
 * <p>
 * Must be in sync with the {@link DEFAULT_ORIGINS_PER_RADIUS} and {@link RADIUS_INCREMENT} values.
 * </p>
 */
export const MAX_OFFSET_TO_SUBJECT_ORIGIN = 150;

/**
 * DP value to increment the radius, when a circumference is full.
 * <p>
 * Must be in sync with the {@link DEFAULT_ORIGINS_PER_RADIUS} and {@link MAX_OFFSET_TO_SUBJECT_ORIGIN} values.
 * </p>
 */
export const RADIUS_INCREMENT = 600;

/**
 * Default value for how many origins can be on a given radius.
 * <p>
 * Defines how many points on the circle's circumference can be used for an origin to spawn cards around on a certain radius.
 * Must be in sync with the {@link RADIUS_INCREMENT} and {@link MAX_OFFSET_TO_SUBJECT_ORIGIN} values.
 * </p>
 */
export const DEFAULT_ORIGINS_PER_RADIUS = 6;
