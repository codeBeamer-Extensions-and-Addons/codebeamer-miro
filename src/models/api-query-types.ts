export interface ItemQueryPage {
	page: number;
	pageSize: number;
	total: number;
	items: any[];
}

export interface TrackerSearchPage {
	page: number;
	pageSize: number;
	total: number;
	trackers: any[];
}

export interface UserQueryPage {
	page: number;
	pageSize: number;
	total: number;
	users: {
		name: string;
		firstName: string;
		lastName: string;
		email: string;
	}[];
}

/**
 * Structure of a swawgger /item/${id}/fields response, showing what
 * fields the item has and which are currently editable or readonly.
 */
export interface CodeBeamerItemFields {
	editableFields: CodeBeamerItemField[];
	readonlyFields: CodeBeamerItemField[];
}

/**
 * Structure of a field in the /item/${id}/fields response /and in the PUT body),
 * specifying a specific field's values.
 */
export interface CodeBeamerItemField {
	fieldId: number;
	name: string;
	values: FieldOptions[];
	type: string;
}

/**
 * Structure of options and minimal information needed to update an item's field with the /Fields endpoint
 */
export interface FieldOptions {
	id: number;
	uri?: string;
	name: string;
	type?: string;
}
