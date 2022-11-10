import {
	BaseQueryFn,
	createApi,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { ProjectListView } from '../models/projectListView.if';
import { TrackerListView } from '../models/trackerListView.if';
import { ItemQueryPage } from '../models/itemQueryPage';
import { CodeBeamerItemsQuery } from '../models/itemQuery';
import TrackerDetails from '../models/trackerDetails.if';
import { CodeBeamerTrackerSchemaEntry } from '../models/trackerSchema.if';
import { Wiki2HtmlQuery } from '../models/wiki2HtmlQuery';
import { CodeBeamerItem } from '../models/codebeamer-item.if';

const dynamicBaseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const baseUrl = `${
		(api.getState() as RootState).boardSettings.cbAddress ||
		'https://codebeamer.com/cb'
	}`;
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
 * Interface to the codebeamer swagger api (~ REST v3)
 */
export const codeBeamerSwaggerApi = createApi({
	baseQuery: dynamicBaseQuery,
	endpoints: (builder) => ({
		testAuthentication: builder.query<
			string,
			{ cbAddress: string; cbUsername: string; cbPassword: string }
		>({
			query: (payload) =>
				`/api/v3/users/findByName?name=${payload.cbUsername}`,
		}),
		getUserByName: builder.query<string, string>({
			query: (name) => `/api/v3/users/findByName?name=${name}`,
		}),
		getProjects: builder.query<ProjectListView[], void>({
			query: () => `/api/v3/projects`,
		}),
		getTrackers: builder.query<TrackerListView[], string>({
			query: (projectId) => `/api/v3/projects/${projectId}/trackers`,
		}),
		getItems: builder.query<ItemQueryPage, CodeBeamerItemsQuery>({
			query: (parameters) => {
				return {
					url: `/api/v3/items/query`,
					method: 'POST',
					body: parameters,
					headers: { 'Content-type': 'application/json' },
				};
			},
		}),
		getItem: builder.query<CodeBeamerItem, string>({
			query: (itemId) => `/api/v3/items/${itemId}`,
		}),
		getTrackerDetails: builder.query<TrackerDetails, string>({
			query: (trackerId) => `/api/v3/trackers/${trackerId}`,
		}),
		getTrackerSchema: builder.query<CodeBeamerTrackerSchemaEntry[], string>(
			{
				query: (trackerId) => `/api/v3/trackers/${trackerId}/schema`,
			}
		),
		getWiki2Html: builder.query<
			string,
			{ projectId: string; body: Wiki2HtmlQuery }
		>({
			query: (parameters) => {
				return {
					url: `/api/v3/projects/${parameters.projectId}/wiki2html`,
					method: 'POST',
					body: parameters.body,
					headers: { 'Content-type': 'application/json' },
				};
			},
		}),
	}),
});

export const {
	useTestAuthenticationQuery,
	useGetUserByNameQuery,
	useLazyGetProjectsQuery,
	useGetTrackersQuery,
	useGetItemsQuery,
	useLazyGetItemQuery,
	useLazyGetItemsQuery,
	useGetTrackerDetailsQuery,
	useGetTrackerSchemaQuery,
	useGetWiki2HtmlQuery,
} = codeBeamerSwaggerApi;
