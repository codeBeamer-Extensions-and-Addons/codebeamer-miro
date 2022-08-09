import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import userSettingsSlice from './slices/userSettingsSlice';
import boardSettingsSlice from './slices/boardSettingsSlice';

import { codeBeamerApi } from '../api/codeBeamerApi';

const configuration = {
	reducer: {
		userSettings: userSettingsSlice,
		boardSettings: boardSettingsSlice,
		[codeBeamerApi.reducerPath]: codeBeamerApi.reducer,
	},
	middleware: (getDefaultMiddleware: () => any[]) =>
		getDefaultMiddleware().concat(codeBeamerApi.middleware),
};

export const store = configureStore(configuration);

export function getStore() {
	return configureStore(configuration);
}

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
