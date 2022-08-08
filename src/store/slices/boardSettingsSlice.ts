import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { BoardSetting } from '../boardSetting.enum';
import { UserMapping } from '../../models/user-mapping.if';
import { ImportConfiguration } from '../../models/import-configuration.if';

export interface BoardSettingsState {
	loading: boolean;
	cbAddress: any;
	projectId: any;
	inboxTrackerId: any;
	userMapping: any[];
	importConfiguration: object;
}

const initialState: BoardSettingsState = {
	loading: false,
	cbAddress: '',
	projectId: '',
	inboxTrackerId: '',
	userMapping: [],
	importConfiguration: {},
};

export const loadBoardSettings = createAsyncThunk(
	'boardSettings/loadBoardSettings',
	async () => {
		if (!window.miro || !miro.board) {
			//TODO simply suspends, doesn't fail
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

			state.cbAddress = action.payload;
		},
		setProjectId: (state, action: PayloadAction<number | string>) => {
			const id = action.payload.toString();
			miro.board.setAppData(BoardSetting.PROJECT_ID, id);

			state.projectId = id;
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
				state.importConfiguration =
					(action.payload[
						BoardSetting.IMPORT_CONFIGURATION
					] as unknown as ImportConfiguration[]) ?? {};

				state.loading = false;
			})
			.addCase(loadBoardSettings.rejected, (state, action) => {});
	},
});

export const { setCbAddress, setProjectId } = boardSettingsSlice.actions;

export default boardSettingsSlice.reducer;
