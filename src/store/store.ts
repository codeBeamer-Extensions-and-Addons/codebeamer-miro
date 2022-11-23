import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import userSettingsSlice from './slices/userSettingsSlice';
import boardSettingsSlice from './slices/boardSettingsSlice';
import appMessagesSlice from './slices/appMessagesSlice';

import { codeBeamerApi } from '../api/codeBeamerApi';
import { rtkQueryErrorLogger } from '../api/rtkQueryErrorLogger';

const configuration = {
	reducer: {
		userSettings: userSettingsSlice,
		boardSettings: boardSettingsSlice,
		appMessages: appMessagesSlice,
		[codeBeamerApi.reducerPath]: codeBeamerApi.reducer,
	},
	middleware: (getDefaultMiddleware: () => any[]) =>
		getDefaultMiddleware().concat(
			codeBeamerApi.middleware,
			rtkQueryErrorLogger
		),
};

export const store = configureStore(configuration);

export function getStore() {
	return configureStore(configuration);
}

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
