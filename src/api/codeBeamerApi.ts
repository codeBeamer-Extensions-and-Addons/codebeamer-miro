import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserSetting } from '../store/userSetting.enum';
import { RootState } from '../store/store';

export const codeBeamerApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: `${localStorage.getItem(UserSetting.CB_ADDRESS)}/api/v3/`,
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
	}),
	endpoints: (builder) => ({
		//TODO interface for that, AuthData or smth
		testAuthentication: builder.query<
			string,
			{ cbAddress: string; cbUsername: string; cbPassword: string }
		>({
			query: (payload) => `users/findByName?name=${payload.cbUsername}`,
		}),
		getUserByName: builder.query<string, string>({
			query: (name) => `users/findByName?name=${name}`,
		}),
	}),
});

export const { useTestAuthenticationQuery, useGetUserByNameQuery } =
	codeBeamerApi;
