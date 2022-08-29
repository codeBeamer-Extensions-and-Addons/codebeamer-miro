import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFilter } from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';
import FilterCriteria from '../filterCriteria/FilterCriteria';

import './activeFilters.css';

export default function ActiveFilters() {
	const dispatch = useDispatch();

	const { activeFilters } = useSelector(
		(state: RootState) => state.userSettings
	);

	const removeCriteria = (id: number) => {
		dispatch(removeFilter(id));
	};

	return (
		<div className="activeFilters">
			{activeFilters.map((f, i) => (
				<FilterCriteria
					key={
						`${f.slug}-${f.value}-${f.id}` /*NOT the id, because it will be reused */
					}
					showId={false}
					filterCriteria={f}
					onRemove={removeCriteria}
				/>
			))}
		</div>
	);
}
