import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';

import AuthForm from '../components/auth';
import {
	useGetUserByNameQuery,
	useTestAuthenticationQuery,
} from '../api/codeBeamerApi';

export default function Content() {
	const { cbAddress, cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.apiConnection
	);

	const { data, error, isLoading } = useTestAuthenticationQuery({
		cbAddress,
		cbUsername,
		cbPassword,
	});

	if (isLoading || error) {
		return <AuthForm loading={isLoading} error={error} />;
	} else
		return (
			<div className="grid wrapper">
				<div className="cs1 ce12">Sup</div>
			</div>
		);
}
