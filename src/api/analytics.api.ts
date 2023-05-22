import { store } from '../store/store';

const baseURL = 'http://localhost:3001/api';

export async function logAction(actionType: string) {
	const username = store.getState().userSettings.cbUsername;

	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			type: actionType,
			user: username,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	};

	const res = await fetch(baseURL + '/post', requestArgs);

	return res;
}
