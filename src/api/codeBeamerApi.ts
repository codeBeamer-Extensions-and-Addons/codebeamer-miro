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
import {
	CodeBeamerItemFields,
	FieldOptions,
	ItemQueryPage,
	TrackerSearchPage,
	UserQueryPage,
} from '../models/api-query-types';
import { CbqlApiQuery } from '../models/cbqlApiQuery';
import TrackerDetails from '../models/trackerDetails.if';
import { CodeBeamerTrackerSchemaEntry } from '../models/trackerSchema.if';
import { Wiki2HtmlQuery } from '../models/wiki2HtmlQuery';
import {
	CodeBeamerItem,
	CodeBeamerLegacyItem,
} from '../models/codebeamer-item.if';
import { CodeBeamerUserReference } from '../models/codebeamer-user-reference.if';

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
 * CodeBeamer REST endpoints from any API version (v1 / v3)
 */
export const codeBeamerApi = createApi({
	baseQuery: dynamicBaseQuery,
	endpoints: (builder) => ({
		testAuthentication: builder.query<
			CodeBeamerUserReference,
			{ cbAddress: string; cbUsername: string; cbPassword: string }
		>({
			query: (payload) => {
				return {
					url: `/api/v3/users/findByName?name=${payload.cbUsername}`,
					method: 'GET',
					responseHandler: async (response) => {
						return (await response.json()) as CodeBeamerUserReference;
					},
				};
			},
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
		getItems: builder.query<ItemQueryPage, CbqlApiQuery>({
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
		getItemLegacy: builder.query<CodeBeamerLegacyItem, string>({
			query: (itemId) => `/rest/item/${itemId}`,
		}),
		updateItemLegacy: builder.query<string, CodeBeamerLegacyItem>({
			query: (item) => {
				return {
					url: `/rest/item`,
					method: 'PUT',
					body: item,
					headers: { 'Content-type': 'application/json' },
					responseHandler: (response) => {
						if (response.ok) return response.text();
						return response.json();
					},
				};
			},
		}),
		getTrackerDetails: builder.query<TrackerDetails, string>({
			query: (trackerId) => `/api/v3/trackers/${trackerId}`,
		}),
		getTrackerSchema: builder.query<
			CodeBeamerTrackerSchemaEntry[],
			string | number
		>({
			query: (trackerId) => `/api/v3/trackers/${trackerId}/schema`,
		}),
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
		getFilteredUsers: builder.query<UserQueryPage, string>({
			query: (filter) =>
				`/rest/users/page/1?pagesize=50&filter=${filter}`,
		}),
		searchTrackers: builder.query<TrackerSearchPage, CbqlApiQuery>({
			query: (parameters) => {
				return {
					url: `/api/v3/items/query`,
					method: 'POST',
					body: parameters,
					headers: { 'Content-type': 'application/json' },
				};
			},
		}),
		getItemFields: builder.query<CodeBeamerItemFields, string | number>({
			query: (itemId) => `api/v3/items/${itemId}/fields`,
		}),
		getFieldOptions: builder.query<
			FieldOptions[],
			{ trackerId: number | string; fieldId: number | string }
		>({
			query: ({ trackerId, fieldId }) =>
				`rest/tracker/${trackerId}/field/${fieldId}/options`,
		}),
		getFieldOptionsSwagger: builder.query<
			FieldOptions[],
			{
				itemId: string | number;
				fieldId: string | number;
				page?: number;
				pageSize?: number;
			}
		>({
			query: (params) =>
				`api/v3/items/${params.itemId}/fields/${
					params.fieldId
				}/options?page=${params.page ?? 1}&pageSize=${
					params.pageSize ?? 25
				}`,
		}),
		getWiki2HtmlLegacy: builder.query<
			string,
			{ itemId: number | string; markup: string }
		>({
			query: (params) => {
				return {
					url: `/rest/item/${params.itemId}/wiki2html`,
					method: 'POST',
					body: params.markup,
					headers: { 'Content-type': 'text/plain' },
					responseHandler: (response) => response.text(),
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
	useLazyGetItemsQuery,
	useGetItemQuery,
	useLazyGetItemQuery,
	useLazyGetItemLegacyQuery,
	useLazyUpdateItemLegacyQuery,
	useGetTrackerDetailsQuery,
	useGetTrackerSchemaQuery,
	useLazyGetTrackerSchemaQuery,
	useGetWiki2HtmlQuery,
	useLazyGetWiki2HtmlLegacyQuery,
	useLazyGetFilteredUsersQuery,
	useGetItemFieldsQuery,
	useLazyGetFieldOptionsQuery,
} = codeBeamerApi;
