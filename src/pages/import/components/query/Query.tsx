import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTrackersQuery } from '../../../../api/codeBeamerApi';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../store/store';

export default function Query() {
	const dispatch = useDispatch();

	const { projectId } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { advancedSearch } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { data, error, isLoading } = useGetTrackersQuery(projectId);

	React.useEffect(() => {
		if (error) {
			console.error(error);
			//TODO miro.showErrorNotif
		}
	}, [error]);

	const handleSelect = (event: any) => {
		dispatch(setTrackerId(event.target.value));
	};

	//TODO select should have "selected" be the locally stored tracker
	if (!advancedSearch) {
		return (
			<div className="grid">
				<div className="cs1 ce3">
					<div className="form-group">
						<label>Tracker</label>
						<select
							className="select"
							onChange={handleSelect}
							data-test="trackerSelect"
						>
							<option value="0">--</option>
							{!isLoading &&
								data?.map((t) => (
									<option value={t.id} key={t.id}>
										{t.name}
									</option>
								))}
						</select>
					</div>
				</div>
				<div className="cs4 ce8 text-center">(Filter Input)</div>
				<div className="cs9 ce12 text-center">(Active Filters)</div>
			</div>
		);
	} else {
		//TODO cqbl input
		return <div>CBQL Input</div>;
	}
}
