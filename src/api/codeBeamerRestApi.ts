import {
	BaseQueryFn,
	createApi,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/dist/query';
import { UserQueryPage } from '../models/UserQueryPage.if';
import { RootState } from '../store/store';

const dynamicBaseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const baseUrl = `${
		(api.getState() as RootState).boardSettings.cbAddress ||
		'https://codebeamer.com/cb'
	}/rest/`;
	const rawBaseQuery = fetchBaseQuery({
		baseUrl,
		prepareHeaders: (headers, { getState }) => {
			const token = btoa(
				`${(getState() as RootState).userSettings.cbUsername}:${
					(getState() as RootState).userSettings.cbPassword
				}`
			);

			if (token) {
				headers.set('Authorization', `Basic ${token}`);
			}

			return headers;
		},
	});
	return rawBaseQuery(args, api, extraOptions);
};

/**
 * Interface to the codebeamer "legacy" REST API (~ REST v1)
 * @see {@link https://codebeamer.com/cb/wiki/117612| codebeamer REST API v1 doc}
 */
export const codeBeamerRestApi = createApi({
	baseQuery: dynamicBaseQuery,
	endpoints: (builder) => ({
		getUsers: builder.query<UserQueryPage, string>({
			query: (filter) => `/users/page/1?pagesize=50&filter=${filter}`,
		}),
	}),
});
