import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../store/store';

import AuthForm from '../auth/auth';
import { useTestAuthenticationQuery } from '../../api/codeBeamerSwaggerApi';
import { loadBoardSettings } from '../../store/slices/boardSettingsSlice';
import ProjectSelection from '../import/components/projectSelection/ProjectSelection';
import Import from '../import/Import';
import Announcements from '../announcements/Announcements';

export default function Content() {
	const dispatch = useDispatch();

	React.useEffect(() => {
		dispatch(loadBoardSettings());
	}, []);

	const { cbUsername, cbPassword, showAnnouncements } = useSelector(
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

	if (cbUsername && showAnnouncements) {
		return <Announcements />;
	} else if (isLoading || error)
		return (
			<div className="centered">
				<AuthForm
					loading={isLoading}
					error={
						cbAddress && cbUsername && cbPassword
							? error
							: undefined
					}
				/>
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
