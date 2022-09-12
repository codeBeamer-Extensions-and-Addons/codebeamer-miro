import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';

export interface AppMessage {
	id?: number;
	header: string | JSX.Element;
	content: string | JSX.Element;
	delay?: number;
	bg:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'danger'
		| 'warning'
		| 'info'
		| 'dark'
		| 'light';
}

export interface AppMessagesState {
	messages: AppMessage[];
}

const initialState: AppMessagesState = {
	messages: [],
};

var increment = 0;

export const appMessagesSlice = createSlice({
	name: 'appMessages',
	initialState,
	reducers: {
		displayAppMessage: (state, action: PayloadAction<AppMessage>) => {
			const message = { ...action.payload, id: increment++ };
			const messages = [...current(state.messages), message];

			state.messages = messages;
		},
		removeAppMessage: (state, action: PayloadAction<number>) => {
			const messages = current(state.messages).filter(
				(f) => f.id !== action.payload
			);

			state.messages = messages;
		},
	},
});

export const { displayAppMessage, removeAppMessage } = appMessagesSlice.actions;

export default appMessagesSlice.reducer;
