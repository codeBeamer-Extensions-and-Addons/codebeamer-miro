/**
 * Interface defining structure of a codebeamer tracker
 */
export interface CodeBeamerTracker {
	id: number;
	name: string;
	description: string;
	descriptionformat: string;
	keyname: string;
	version: number;
	createdAt: Date | string;
	createdBy: CodeBeamerUserReference;
	type: CodeBeamerTrackerTypeReference;
	deleted: boolean;
	hidden: boolean;
	color: string;
	usingWorkflow: boolean;
	onlyWorkflowCanCreateNewReferringItem: boolean;
	usingQuickTransitions: boolean;
	defaultShowAncestorItems: boolean;
	defaultShowDescendantItems: boolean;
	project: CodeBeamerProjectReference;
	availableAsTemplate: boolean;
	sharedInWorkingSet: boolean;
}

/**
 * Interface for down-/upstream references (and probably incoming-/outgoing associations)
 */
export interface CodeBeamerRelation {
  id: number,
  itemRevision: CodeBeamerItemRevision,
  type: string,
}

/**
 * Interface for a cb item revision entity
 */
export interface CodeBeamerItemRevision {
  id: number,
  version: number
}

export interface CodeBeamerItemRelations {
  itemId: CodeBeamerItemRevision,
  downstreamRefernces: CodeBeamerRelation[],
  upstreamReferences: CodeBeamerRelation[],
  //probably also of type CbRelation, but not proven yet
  incomingAssociations: any[],
  //probably also of type CbRelation, but not proven yet
  outgoingAssociations: any[],
}

/**
 * Interface defining structure of a codebeamer item
 * Though I think there's a more rich variant of this. But this structure here is what I got by making some API calls for items
 */
export interface CodeBeamerItem {
  id: number,
  name: string,
  description: string,
  descriptionFormat: string,
  createdAt: Date | string,
  createdBy: CodeBeamerUserReference,
  modifiedAt: Date | string,
  modifiedBy: CodeBeamerUserReference,
  owners: CodeBeamerUserReference[],
  version: number,
  assignedTo: CodeBeamerUserReference[],
  tracker: CodeBeamerTrackerTypeReference,
  //not sure about type, though likely "CodeBeamerItem"
  children: any[],
  //not sure about type
  customFields: any[],
  priority: CodeBeamerChoiceOptionReference,
  status: CodeBeamerChoiceOptionReference,
  //not sure about type
  categories: any[],
  //not sure about type
  resolutions: any[],
  //not sure about type
  severities: any[],
  //not sure about type
  versions: any[],
  ordinal: number,
  typename: string,
  //not sure about type
  comments: any[]
}

/**
 * Interface for a crude cb item, used when creating one from a miro widget
 */
export interface CodeBeamerCreateItem {
  name: string,
  description: string,
}

export interface CodeBeamerChoiceOptionReference {
  id: number,
  name: string,
  type: string
}

/**
 * Interface defining structure of a codebeamer project reference
 */
export interface CodeBeamerProjectReference {
	id: number;
	name: string;
	type: string;
}

/**
 * Interface defining structure of a codebeamer trackertype reference
 */
export interface CodeBeamerTrackerTypeReference {
	id: number;
	name: string;
	type: string;
}

/**
 * Interface defining structure of a codebeamer user reference
 */
export interface CodeBeamerUserReference {
	id: number;
	name: string;
	type: string;
	email: string;
}

/**
 * Enumeration of codebeamer relation types
 */
export enum CodeBeamerRelationType {
  OUTGOING_ASSOCIATION = 'OutgoingTrackerItemAssociation',
  INCOMING_ASSOCIATION = 'IncomingTrackerItemAssociation',
  UPSTREAM_REFERENCE = 'UpstreamTrackerItemReference',
  DOWNSTREAM_REFERENCE = 'DownstreamTrackerItemReference',
}
