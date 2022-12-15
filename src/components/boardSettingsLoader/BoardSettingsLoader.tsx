import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForm from '../../pages/auth/auth';
import { loadBoardSettings } from '../../store/slices/boardSettingsSlice';
import { RootState } from '../../store/store';

/**
 * Wrapper for anything that needs the board settings loaded before it does anything
 *
 * Shows the Auth Form while loading by default, which can be toggled via props
 */
export default function BoardSettingsLoader(props: {
	children: JSX.Element;
	showAuthWhileLoading?: boolean;
}) {
	const dispatch = useDispatch();

	const { loading } = useSelector((state: RootState) => state.boardSettings);

	React.useEffect(() => {
		dispatch(loadBoardSettings());
	}, []);

	return (
		<>
			{loading && (props.showAuthWhileLoading ?? true) && (
				<div className="centered">
					<AuthForm loading={true} />
				</div>
			)}
			{!loading && props.children}
		</>
	);
}
