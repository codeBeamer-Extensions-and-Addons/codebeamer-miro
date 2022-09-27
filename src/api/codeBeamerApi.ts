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

const dynamicBaseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const baseUrl = `${
		(api.getState() as RootState).boardSettings.cbAddress ??
		'https://codebeamer.com/cb'
	}/api/v3/`;
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

export const codeBeamerApi = createApi({
	baseQuery: dynamicBaseQuery,
	endpoints: (builder) => ({
		testAuthentication: builder.query<
			string,
			{ cbAddress: string; cbUsername: string; cbPassword: string }
		>({
			query: (payload) => `users/findByName?name=${payload.cbUsername}`,
		}),
		getUserByName: builder.query<string, string>({
			query: (name) => `users/findByName?name=${name}`,
		}),
		getProjects: builder.query<ProjectListView[], void>({
			query: () => `projects`,
		}),
		getTrackers: builder.query<TrackerListView[], string>({
			query: (projectId) => `projects/${projectId}/trackers`,
		}),
		getItems: builder.query<ItemQueryPage, CodeBeamerItemsQuery>({
			query: (parameters) => {
				return {
					url: `/items/query`,
					method: 'POST',
					body: parameters,
					headers: { 'Content-type': 'application/json' },
				};
			},
		}),
		getTrackerDetails: builder.query<TrackerDetails, string>({
			query: (trackerId) => `trackers/${trackerId}`,
		}),
		getTrackerSchema: builder.query<CodeBeamerTrackerSchemaEntry[], string>(
			{
				query: (trackerId) => `trackers/${trackerId}/schema`,
			}
		),
	}),
});

export const {
	useTestAuthenticationQuery,
	useGetUserByNameQuery,
	useLazyGetProjectsQuery,
	useGetTrackersQuery,
	useGetItemsQuery,
	useLazyGetItemsQuery,
	useGetTrackerDetailsQuery,
	useGetTrackerSchemaQuery,
} = codeBeamerApi;
