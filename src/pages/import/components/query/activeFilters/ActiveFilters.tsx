import { Field, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	removeFilter,
	resetCbqlStringToCurrentParameters,
	setAndOrFilter,
	setAndOrFilterEnabled,
} from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';
import FilterCriteria from '../filterCriteria/FilterCriteria';

import './activeFilters.css';

export default function ActiveFilters() {
	const dispatch = useDispatch();

	const { activeFilters, andOrFilterEnabled, andOrFilter } = useSelector(
		(state: RootState) => state.userSettings
	);

	const removeCriteria = (id: number) => {
		dispatch(removeFilter(id));
	};

	const removeAndOr = () => {
		dispatch(setAndOrFilterEnabled(false));
		dispatch(resetCbqlStringToCurrentParameters());
	};

	return (
		<div className="grid activeFiltersWrapper">
			<div
				className={`activeFilters cs1 ${
					andOrFilterEnabled ? 'ce8' : 'ce9'
				}`}
			>
				{activeFilters.map((f, i) => (
					<FilterCriteria
						key={
							`${f.slug}-${f.value}-${f.id}` /*NOT just the id, because it will be reused */
						}
						showId={andOrFilterEnabled}
						filterCriteria={f}
						onRemove={removeCriteria}
					/>
				))}
			</div>
			<div className={`${andOrFilterEnabled ? 'cs9' : 'cs10'} ce12`}>
				{!andOrFilterEnabled && (
					<span
						className="link-label"
						title="Add AND/OR logic"
						onClick={() => {
							dispatch(setAndOrFilterEnabled(true));
							dispatch(setAndOrFilter(andOrFilter));
						}}
						data-test="showAndOr"
					>
						<span className="link-label-icon">+</span>{' '}
						<span className="link-label-text">AND/OR</span>
					</span>
				)}
				{andOrFilterEnabled && (
					<div>
						<Formik
							initialValues={{ andOrLogic: andOrFilter ?? '' }}
							enableReinitialize={true}
							//* leaving this failed attempt here, to potentially accelerate revamp attempts
							// validate={(values) => {
							// 	const errors: { andOrLogic?: string } = {};

							// 	const allowedIds = activeFilters
							// 		.map((f) => (f.id! + 1).toString())
							// 		.join('');

							// 	//* not quite what we'd need
							// 	const regex: RegExp = new RegExp(
							// 		`^(\\(?)+|(([${allowedIds}]{1})? (AND|OR) \\(?[${allowedIds}]{1})+(\\)?)+`,
							// 		'g'
							// 	);

							// 	console.log(regex.source);

							// 	console.log(
							// 		'Validated: ',
							// 		regex.test(values.andOrLogic)
							// 	);

							// 	if (!regex.test(values.andOrLogic))
							// 		errors.andOrLogic = 'Invalid AND/OR Logic';

							// 	return errors;
							// }}
							onSubmit={(values) => {
								dispatch(setAndOrFilter(values.andOrLogic));
							}}
							validateOnChange={true}
						>
							{({ errors, handleSubmit }) => (
								<form onSubmit={handleSubmit}>
									<div className="grid">
										<div className="cs1 ce10">
											<Field
												name="andOrLogic"
												placeholder="e.g. (1 OR 2)"
												className={`input input-small ${
													errors.andOrLogic
														? 'error'
														: 'success'
												}`}
												data-test="andOrInput"
											></Field>
										</div>
										<div className="cs11 ce12">
											<div
												className="filter-remove v-align-middle bg-light-indigo"
												onClick={() => removeAndOr()}
												data-test="hideAndOr"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="ionicon v-align-sub"
													viewBox="0 0 512 512"
												>
													<title>Cancel</title>
													<path
														fill="none"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="32"
														d="M368 368L144 144M368 144L144 368"
													/>
												</svg>
											</div>
										</div>
									</div>
								</form>
							)}
						</Formik>
					</div>
				)}
			</div>
		</div>
	);
}
