import {
	isRejectedWithValue,
	Middleware,
	MiddlewareAPI,
} from '@reduxjs/toolkit';
import { displayAppMessage } from '../store/slices/appMessagesSlice';
import { store } from '../store/store';

export const rtkQueryErrorLogger: Middleware =
	(api: MiddlewareAPI) => (next) => (action) => {
		if (isRejectedWithValue(action)) {
			if (
				action.payload?.data?.message &&
				action.payload.data.message == 'Not authenticated'
			) {
				//* just ignore it. would appear every time you open the app, but doesn't need this kind of communication
				next(action);
			}
			console.error('Error in API query - Action: ', action);
			store.dispatch(
				displayAppMessage({
					header: 'Error',
					content:
						action.payload?.data?.message ??
						'An error occured! Check the console for potential details.',
					bg: 'danger',
					delay: 3500,
				})
			);
		}
		next(action);
	};
