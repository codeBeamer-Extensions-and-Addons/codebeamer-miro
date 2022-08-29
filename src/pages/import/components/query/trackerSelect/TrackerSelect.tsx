import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTrackersQuery } from '../../../../../api/codeBeamerApi';
import { setTrackerId } from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';

export default function TrackerSelect() {
	const dispatch = useDispatch();

	const { projectId } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { trackerId } = useSelector((state: RootState) => state.userSettings);

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

	/**
	 * Once we got or update (latter shouldn't ever be the case) the trackers, programmatically
	 * select the cached selected Tracker for the user's convenience.
	 */
	React.useEffect(() => {
		if (!isLoading) {
			(
				document.getElementById('trackerSelect') as HTMLSelectElement
			).value = trackerId;
		}
	}, [isLoading]);

	return (
		<div className="form-group">
			<label className="text-center">Tracker</label>
			<select
				className="select"
				onChange={handleSelect}
				data-test="trackerSelect"
				id="trackerSelect"
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
	);
}
