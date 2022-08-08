import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { UserSetting } from '../userSetting.enum';
import { SubqueryLinkMethod } from '../enums/subquery-link-method.enum';
import { FilterCriteria } from '../../models/filterCriteria.if';
import getFilterQuerySubstring from '../util/updateCbqlString';
import getCbqlString from '../util/updateCbqlString';

export interface UserSettingsState {
	cbAddress: string;
	cbqlString: string;
	cbUsername: string;
	cbPassword: string;
	trackerId: string;
	advancedSearch: boolean;
	activeFilters: FilterCriteria[];
	subqueryChaining: string;
}

const initialState: UserSettingsState = {
	cbAddress: localStorage.getItem(UserSetting.CB_ADDRESS) ?? '',
	cbqlString: localStorage.getItem(UserSetting.CBQL_STRING) ?? '',
	cbUsername: localStorage.getItem(UserSetting.CB_USERNAME) ?? '',
	cbPassword: sessionStorage.getItem(UserSetting.CB_PASSWORD) ?? '',
	trackerId: localStorage.getItem(UserSetting.SELECTED_TRACKER) ?? '',
	advancedSearch:
		localStorage.getItem(UserSetting.ADVANCED_SEARCH_ENABLED) === 'true',
	activeFilters: [],
	subqueryChaining:
		localStorage.getItem(UserSetting.SUBQUERY_LINK_METHOD) ??
		SubqueryLinkMethod.AND,
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

			localStorage.setItem(
				UserSetting.CB_USERNAME,
				action.payload.username
			);
			sessionStorage.setItem(
				UserSetting.CB_PASSWORD,
				action.payload.password
			);
		},
		setTrackerId: (state, action: PayloadAction<string>) => {
			state.trackerId = action.payload;
			localStorage.setItem(UserSetting.SELECTED_TRACKER, action.payload);

			state.cbqlString = getCbqlString(
				state.activeFilters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
		},
		setAdvancedSearch: (state, action: PayloadAction<boolean>) => {
			state.advancedSearch = action.payload;
			localStorage.setItem(
				UserSetting.ADVANCED_SEARCH_ENABLED,
				action.payload.toString()
			);
		},
		addFilter: (state, action: PayloadAction<FilterCriteria>) => {
			//TODO add to state

			state.cbqlString = getCbqlString(
				state.activeFilters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
		},
		removeFilter: (state, action: PayloadAction<string | number>) => {
			//TODO remove from state

			state.cbqlString = getCbqlString(
				state.activeFilters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
		},
	},
});

export const {
	setCredentials,
	setTrackerId,
	setAdvancedSearch,
	addFilter,
	removeFilter,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
