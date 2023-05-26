import { store } from '../store/store';

const baseURL = 'http://localhost:3001/api';

export async function logProjectSelection(
	cbAddress: any,
	projectId: string | number,
	projectLabel: string
) {
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			cbAddress: cbAddress,
			projectId: projectId,
			projectLabel: projectLabel,
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	};

	await fetch(baseURL + '/project', requestArgs);
}

export async function logPageOpened(page: string) {
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			name: page,
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
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
		},
	};

	await fetch(baseURL + '/connection', requestArgs);
}

export async function logItemImport(totalItems: number | undefined) {
	const username = store.getState().userSettings.cbUsername;
	const requestArgs = {
		method: 'POST',
		body: JSON.stringify({
			totalItems: totalItems,
			user: username,
			date: new Date(),
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	};

	await fetch(baseURL + '/itemImport', requestArgs);
}
