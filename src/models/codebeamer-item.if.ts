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
