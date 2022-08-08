import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store/store';

import AuthForm from '../components/auth';
import {
	useGetUserByNameQuery,
	useTestAuthenticationQuery,
} from '../api/codeBeamerApi';
import { loadBoardSettings } from '../store/boardSettingsSlice';

export default function Content() {
	const dispatch = useDispatch();

	React.useEffect(() => {
		dispatch(loadBoardSettings());
	}, []);

	const { cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { cbAddress, loading } = useSelector(
		(state: RootState) => state.boardSettings
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
