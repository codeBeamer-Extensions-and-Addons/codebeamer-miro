import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import { Setting } from './settings.enum';

export interface ApiConnectionState {
	cbAddress: string;
	projectId: string;
	cbqlString: string;
	cbUsername: string;
	cbPassword: string;
}

const initialState: ApiConnectionState = {
	cbAddress: localStorage.getItem(Setting.CB_ADDRESS) ?? '',
	projectId: localStorage.getItem(Setting.PROJECT_ID) ?? '',
	cbqlString: localStorage.getItem(Setting.CBQL_STRING) ?? '',
	cbUsername: localStorage.getItem(Setting.CB_USERNAME) ?? '',
	cbPassword: sessionStorage.getItem(Setting.CB_PASSWORD) ?? '',
};

export const apiConnectionSlice = createSlice({
	name: 'apiConnection',
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ username: string; password: string }>
		) => {
			state.cbUsername = action.payload.username;
			state.cbPassword = action.payload.password;

			localStorage.setItem(Setting.CB_USERNAME, state.cbUsername);
			sessionStorage.setItem(Setting.CB_PASSWORD, state.cbPassword);
		},
		setCbAddress: (state, action: PayloadAction<string>) => {
			state.cbAddress = action.payload;

			localStorage.setItem(Setting.CB_ADDRESS, state.cbAddress);
		},
		//TODO etc.
	},
});

export const { setCredentials, setCbAddress } = apiConnectionSlice.actions;

export default apiConnectionSlice.reducer;
