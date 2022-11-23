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

export interface FieldOptions {
	id: number;
	uri: string;
	name: string;
}
