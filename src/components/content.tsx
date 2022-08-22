import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store/store';

import AuthForm from '../pages/auth/auth';
import { useTestAuthenticationQuery } from '../api/codeBeamerApi';
import { loadBoardSettings } from '../store/slices/boardSettingsSlice';
import ProjectSelection from '../pages/import/components/projectSelection/ProjectSelection';
import Import from '../pages/import/Import';

export default function Content() {
	const dispatch = useDispatch();

	React.useEffect(() => {
		dispatch(loadBoardSettings());
	}, []);

	const { cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { cbAddress, projectId, loading } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { data, error, isLoading } = useTestAuthenticationQuery({
		cbAddress,
		cbUsername,
		cbPassword,
	});

	if (isLoading || error)
		return (
			<div className="centered fade-in">
				<AuthForm loading={isLoading} error={error} />
			</div>
		);
	else if (!projectId)
		return (
			<div className="centered fade-in">
				<ProjectSelection />
			</div>
		);
	else return <Import />;
}
