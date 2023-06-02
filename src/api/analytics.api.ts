import { CodeBeamerItem } from '../models/codebeamer-item.if';
import { store } from '../store/store';

const baseURL = 'http://localhost:3001/api';
const apiKey = '6mxzrsb2tt6j5qv0m2wu47xmqyh2mg';

export async function logProjectSelection(
	cbAddress: any,
	projectId: string | number,
	projectLabel: string
) {
	const username = store.getState().userSettings.cbUsername;
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			cbAddress: cbAddress,
			projectId: projectId,
			projectLabel: projectLabel,
			user: username,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
			'x-api-key': apiKey,
		},
	};

	await fetch(baseURL + '/project', requestArgs);
}

export async function logPageOpened(page: string) {
	const username = store.getState().userSettings.cbUsername;
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			name: page,
			user: username,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
			'x-api-key': apiKey,
		},
	};

	await fetch(baseURL + '/page', requestArgs);
}

export async function logConnection(cbAddress: string, cbUsername: string) {
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			user: cbUsername,
			cbAddress: cbAddress,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
			'x-api-key': apiKey,
		},
	};

	await fetch(baseURL + '/connection', requestArgs);
}

export async function logItemImport(
	items: CodeBeamerItem[],
	totalItems: number | undefined
) {
	const username = store.getState().userSettings.cbUsername;
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			items: items,
			totalItems: totalItems,
			user: username,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
			'x-api-key': apiKey,
		},
	};

	await fetch(baseURL + '/itemImport', requestArgs);
}

export async function logError(message: string) {
	const username = store.getState().userSettings.cbUsername;
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			message: message,
			user: username,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
			'x-api-key': apiKey,
		},
	};

	await fetch(baseURL + '/error', requestArgs);
}
