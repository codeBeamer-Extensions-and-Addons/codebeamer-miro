import {
	isRejectedWithValue,
	Middleware,
	MiddlewareAPI,
} from '@reduxjs/toolkit';

const DEFAULT_MESSAGE = `Error fetching data - See the console for details.`;

export const rtkQueryErrorLogger: Middleware =
	(api: MiddlewareAPI) => (next) => (action) => {
		if (isRejectedWithValue(action)) {
			if (action.payload?.status == 401) {
				// ignore
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
		}
		next(action);
	};
