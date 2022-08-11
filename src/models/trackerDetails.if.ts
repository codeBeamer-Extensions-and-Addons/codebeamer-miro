import { CodeBeamerReference } from './codebeamer-reference.if';
import { CodeBeamerUserReference } from './codebeamer-user-reference.if';

export default interface TrackerDetails {
	id: number;
	name: string;
	description: string;
	descriptionFormat: string;
	keyName: string;
	version: number;
	createdAt: Date;
	createdBy: CodeBeamerUserReference;
	type: CodeBeamerReference;
	deleted: boolean;
	hidden: boolean;
	color: string;
	usingWorkflow: boolean;
	onlyWorkflowCanCreateNewReferringItem: boolean;
	usingQuickTransitions: boolean;
	defaultShowAncestorItems: boolean;
	defaultShowDescendantItems: boolean;
	project: CodeBeamerReference;
	availableAsTemplate: boolean;
	sharedInWorkingSet: boolean;
}
