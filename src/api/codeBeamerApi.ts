import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Setting } from '../store/settings.enum';
import { RootState } from '../store/store';

export const codeBeamerApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: `${localStorage.getItem(Setting.CB_ADDRESS)}/api/v3/`,
		prepareHeaders: (headers, { getState }) => {
			const token = btoa(
				`${(getState() as RootState).apiConnection.cbUsername}:${
					(getState() as RootState).apiConnection.cbPassword
				}`
			);

			if (token) {
				headers.set('Authorization', `Basic ${token}`);
			}

			return headers;
		},
	}),
	endpoints: (builder) => ({
		getUserByName: builder.query<string, string>({
			query: (name) => `users/findByName?name=${name}`,
		}),
	}),
});

export const { useGetUserByNameQuery } = codeBeamerApi;
