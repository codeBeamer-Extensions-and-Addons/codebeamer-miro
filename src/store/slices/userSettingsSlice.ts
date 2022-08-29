import { createSlice, current } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { UserSetting } from '../enums/userSetting.enum';
import { SubqueryLinkMethod } from '../enums/subquery-link-method.enum';
import { IFilterCriteria } from '../../models/filterCriteria.if';
import getCbqlString from '../util/updateCbqlString';

export interface UserSettingsState {
	cbAddress: string;
	cbqlString: string;
	cbUsername: string;
	cbPassword: string;
	trackerId: string;
	advancedSearch: boolean;
	activeFilters: IFilterCriteria[];
	subqueryChaining: string;
}

const initialState: UserSettingsState = {
	cbAddress: localStorage.getItem(UserSetting.CB_ADDRESS) ?? '',
	cbqlString: localStorage.getItem(UserSetting.CBQL_STRING) ?? '',
	cbUsername: localStorage.getItem(UserSetting.CB_USERNAME) ?? '',
	cbPassword: sessionStorage.getItem(UserSetting.CB_PASSWORD) ?? '',
	trackerId: localStorage.getItem(UserSetting.SELECTED_TRACKER) ?? '',
	advancedSearch: localStorage.getItem(UserSetting.ADVANCED_SEARCH_ENABLED)
		? localStorage.getItem(UserSetting.ADVANCED_SEARCH_ENABLED) == 'true'
		: false,
	activeFilters: JSON.parse(
		localStorage.getItem(UserSetting.FILTER_CRITERIA) ?? '[]'
	) as IFilterCriteria[],
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
		setCbqlString: (state, action: PayloadAction<string>) => {
			state.cbqlString = action.payload;
			localStorage.setItem(UserSetting.CBQL_STRING, action.payload);
		},
		setTrackerId: (state, action: PayloadAction<string>) => {
			state.trackerId = action.payload;
			localStorage.setItem(UserSetting.SELECTED_TRACKER, action.payload);

			const cbqlString = getCbqlString(
				state.activeFilters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
		setAdvancedSearch: (state, action: PayloadAction<boolean>) => {
			state.advancedSearch = action.payload;
			localStorage.setItem(
				UserSetting.ADVANCED_SEARCH_ENABLED,
				action.payload.toString()
			);
		},
		addFilter: (state, action: PayloadAction<IFilterCriteria>) => {
			const newFilter = {
				...action.payload,
				id: state.activeFilters.length,
			};
			const filters = [...current(state.activeFilters), newFilter];

			state.activeFilters = filters;
			localStorage.setItem(
				UserSetting.FILTER_CRITERIA,
				JSON.stringify(filters)
			);

			const cbqlString = getCbqlString(
				filters,
				state.subqueryChaining.toString(),
				state.trackerId
			);

			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
		removeFilter: (state, action: PayloadAction<number>) => {
			const filters = current(state.activeFilters)
				.filter((f) => f.id !== action.payload)
				.map((f, i) => {
					return { ...f, id: i };
				});

			state.activeFilters = filters;

			state.activeFilters = filters;
			localStorage.setItem(
				UserSetting.FILTER_CRITERIA,
				JSON.stringify(filters)
			);

			const cbqlString = getCbqlString(
				filters,
				state.subqueryChaining.toString(),
				state.trackerId
			);
			state.cbqlString = cbqlString;
			localStorage.setItem(UserSetting.CBQL_STRING, cbqlString);
		},
	},
});

export const {
	setCredentials,
	setTrackerId,
	setAdvancedSearch,
	addFilter,
	removeFilter,
	setCbqlString,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
