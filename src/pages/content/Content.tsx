import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store';

import AuthForm from '../auth/auth';
import ProjectSelection from '../import/components/projectSelection/ProjectSelection';
import Import from '../import/Import';
import Announcements from '../announcements/Announcements';
import { useIsAuthenticated } from '../../hooks/useIsAuthenticated';

export default function Content() {
	const { showAnnouncements } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { projectId } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const [isAuthenticated, isAuthenticating] = useIsAuthenticated();

	if (showAnnouncements) {
		return <Announcements />;
	} else if (isAuthenticating || !isAuthenticated)
		return (
			<div className="centered">
				<AuthForm loading={isAuthenticating} />
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
