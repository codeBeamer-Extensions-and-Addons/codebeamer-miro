/**
 * Structure of a response from /cb/rest/users/page
 */
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
