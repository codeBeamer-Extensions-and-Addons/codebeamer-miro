import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import CbqlInput from './cbqlInput/CbqlInput';
import TrackerSelect from './trackerSelect/TrackerSelect';

export default function Query() {
	const { advancedSearch } = useSelector(
		(state: RootState) => state.userSettings
	);

	if (!advancedSearch) {
		return (
			<div className="grid">
				<div className="cs1 ce3">
					<TrackerSelect />
				</div>
				<div className="cs4 ce8 text-center">(Filter Input)</div>
				<div className="cs9 ce12 text-center">(Active Filters)</div>
			</div>
		);
	} else {
		return <CbqlInput />;
	}
}
