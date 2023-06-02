import {
	isRejectedWithValue,
	Middleware,
	MiddlewareAPI,
} from '@reduxjs/toolkit';
import { logError } from './analytics.api';

const DEFAULT_MESSAGE = `Error fetching data - See the console for details.`;

export const rtkQueryErrorLogger: Middleware =
	(api: MiddlewareAPI) => (next) => (action) => {
		if (isRejectedWithValue(action)) {
			if (action.payload?.status == 401) {
				// ignore
				return next(action);
			}
			if (action.payload?.status == 403) {
				if (action.payload.data.message == 'User is locked')
					//ignore. that somehow always fires in the very first attempt, but never holds true for long.
					return next(action);
			}
			console.error('Error in API query - Action: ', action);
			let message = `Error fetching data - ${
				action.payload.data?.message ?? ''
			} [${action.payload.status}]`;
			if (message.length >= 80) {
				message = DEFAULT_MESSAGE;
			}
			miro.board.notifications.showError(message);
			logError(message);
		}
		next(action);
	};
