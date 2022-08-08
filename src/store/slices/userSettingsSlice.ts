import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { UserSetting } from '../userSetting.enum';

export interface UserSettingsState {
	cbAddress: string;
	cbqlString: string;
	cbUsername: string;
	cbPassword: string;
}

const initialState: UserSettingsState = {
	cbAddress: localStorage.getItem(UserSetting.CB_ADDRESS) ?? '',
	cbqlString: localStorage.getItem(UserSetting.CBQL_STRING) ?? '',
	cbUsername: localStorage.getItem(UserSetting.CB_USERNAME) ?? '',
	cbPassword: sessionStorage.getItem(UserSetting.CB_PASSWORD) ?? '',
};

export const userSettingsSlice = createSlice({
	name: 'userSettings',
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ username: string; password: string }>
		) => {
			state.cbUsername = action.payload.username;
			state.cbPassword = action.payload.password;

			localStorage.setItem(UserSetting.CB_USERNAME, state.cbUsername);
			sessionStorage.setItem(UserSetting.CB_PASSWORD, state.cbPassword);
		},
		//TODO etc.
	},
});

export const { setCredentials } = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
