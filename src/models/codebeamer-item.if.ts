import { CodeBeamerReference } from './codebeamer-reference.if';
import { CodeBeamerUserReference } from './codebeamer-user-reference.if';

/**
 * General structure of a CodeBeamerItem as received from the API.
 */
export interface CodeBeamerItem {
	id: number;
	name: string;
	description: string;
	descriptionFormat: string;
	createdAt: Date | any;
	createdBy: CodeBeamerUserReference;
	modifiedAt: Date | any;
	modifiedBy: CodeBeamerUserReference;
	owners: CodeBeamerUserReference[];
	version: number;
	assignedTo: CodeBeamerUserReference[];
	tracker: CodeBeamerReference;
	children: any[];
	customFields: any[];
	priority: CodeBeamerReference;
	status: CodeBeamerReference;
	categories: CodeBeamerReference[];
	subjects: CodeBeamerReference[];
	teams: CodeBeamerReference[];
	storyPoints: number;
	versions: any[];
	ordinal: number;
	typeName: string;
	comments: any[];
}

/**
 * Some handpicked properties of what the legacy rest API gives you when you query an item's details.
 *
 * Currently only used to update it
 */
export interface CodeBeamerLegacyItem {
	id?: number;
	uri: string;
	tracker?: any;
	supervisors?: any[];
	name?: string;
	status?: any;
	realizedFeaturess?: any[];
	versions?: any[];
	storyPoints?: number;
	team?: any[];
	assignedTo?: any[];
}
