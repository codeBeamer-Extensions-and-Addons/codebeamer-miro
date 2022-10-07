/**
 * Generic reference an item can have as value for one of its properties
 */
export interface CodeBeamerReference {
	id: number;
	name: string;
	keyName?: string;
	color?: string;
	type: string;
}
