import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { BoardSetting } from '../enums/boardSetting.enum';
import { UserMapping } from '../../models/user-mapping.if';
import {
	IAppCardTagSetting,
	IAppCardTagSettings,
} from '../../models/import-configuration.if';

export interface BoardSettingsState {
	loading: boolean;
	cbAddress: any;
	projectId: any;
	inboxTrackerId: any;
	userMapping: any[];
	cardTagConfiguration: any;
}

const initialState: BoardSettingsState = {
	loading: false,
	cbAddress: '',
	projectId: '',
	inboxTrackerId: '',
	userMapping: [],
	cardTagConfiguration: { standard: {}, trackerSpecific: {} },
};

export const loadBoardSettings = createAsyncThunk(
	'boardSettings/loadBoardSettings',
	async () => {
		if (!window.miro || !miro.board) {
			throw new Error('Miro not attached to the window');
		}
		return await miro.board.getAppData();
	}
);

export const boardSettingsSlice = createSlice({
	name: 'boardSettings',
	initialState,
	reducers: {
		setCbAddress: (state, action: PayloadAction<string>) => {
			miro.board.setAppData(BoardSetting.CB_ADDRESS, action.payload);

			//additionally stored in local storage because only then can we use it
			//in the api's baseQuery factory
			localStorage.setItem(BoardSetting.CB_ADDRESS, action.payload);

			state.cbAddress = action.payload;
		},
		setProjectId: (state, action: PayloadAction<number | string>) => {
			const id = action.payload.toString();
			miro.board.setAppData(BoardSetting.PROJECT_ID, id);

			state.projectId = id;
		},
		setStandardCardTagConfiguration: (
			state,
			action: PayloadAction<IAppCardTagSetting>
		) => {
			state.cardTagConfiguration.standard[action.payload.property] =
				action.payload.value;

			miro.board.setAppData(
				BoardSetting.CARD_TAG_CONFIGURATION,
				structuredClone(current(state.cardTagConfiguration))
			);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loadBoardSettings.pending, (state, action) => {
				state.loading = true;
			})
			.addCase(loadBoardSettings.fulfilled, (state, action) => {
				state.cbAddress = action.payload[BoardSetting.CB_ADDRESS] ?? '';
				state.projectId = action.payload[BoardSetting.PROJECT_ID] ?? '';
				state.inboxTrackerId =
					action.payload[BoardSetting.INBOX_TRACKER_ID] ?? '';
				state.userMapping =
					(action.payload[
						BoardSetting.USER_MAPPING
					] as unknown as UserMapping[]) ?? {};
				state.cardTagConfiguration = (action.payload[
					BoardSetting.CARD_TAG_CONFIGURATION
				] as unknown as IAppCardTagSettings) ?? {
					standard: {},
					trackerSpecific: {},
				};

				state.loading = false;
			})
			.addCase(loadBoardSettings.rejected, (state, action) => {});
	},
});

export const { setCbAddress, setProjectId, setStandardCardTagConfiguration } =
	boardSettingsSlice.actions;

export default boardSettingsSlice.reducer;
