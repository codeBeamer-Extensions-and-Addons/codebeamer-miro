import { configureStore } from '@reduxjs/toolkit';

import apiConnectionSlice from './apiConnectionSlice';

export const store = configureStore({
	reducer: {
		apiConnection: apiConnectionSlice,
	},
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
