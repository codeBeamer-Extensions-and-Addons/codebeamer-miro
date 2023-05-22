import { store } from '../store/store';

export async function logAction() {
	const username = store.getState().userSettings.cbUsername;

	const requestArgs = {
		method: 'GET',
	};

	const res = await fetch('http://localhost:3001/api/getAll', requestArgs);

	return res.json();
}
