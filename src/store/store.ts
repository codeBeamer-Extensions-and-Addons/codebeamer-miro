import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import userSettingsSlice from './userSettingsSlice';
import boardSettingsSlice from './boardSettingsSlice';

import { codeBeamerApi } from '../api/codeBeamerApi';

export const store = configureStore({
	reducer: {
		userSettings: userSettingsSlice,
		boardSettings: boardSettingsSlice,
		[codeBeamerApi.reducerPath]: codeBeamerApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(codeBeamerApi.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
