import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import apiConnectionSlice from './apiConnectionSlice';
import { codeBeamerApi } from '../api/codeBeamerApi';

export const store = configureStore({
	reducer: {
		apiConnection: apiConnectionSlice,
		[codeBeamerApi.reducerPath]: codeBeamerApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(codeBeamerApi.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
