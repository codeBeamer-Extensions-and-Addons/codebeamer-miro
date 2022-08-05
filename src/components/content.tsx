import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';

import AuthForm from '../components/auth';
import { useGetUserByNameQuery } from '../api/codeBeamerApi';

export default function Content() {
	const { cbUsername } = useSelector(
		(state: RootState) => state.apiConnection
	);

	const { data, error, isLoading } = useGetUserByNameQuery(cbUsername);

	if (isLoading) {
		return (
			<div className="centered">
				<h5>Establishing connection...</h5>
				<button
					type="button"
					className="button button-secondary button-loading"
				></button>
			</div>
		);
	} else if (error) {
		return <AuthForm />;
	} else
		return (
			<div className="grid wrapper">
				<div className="cs1 ce12">Sup</div>
			</div>
		);
}
