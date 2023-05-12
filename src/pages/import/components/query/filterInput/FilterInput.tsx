import { Field, Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTrackerSchemaQuery } from '../../../../../api/codeBeamerApi';
import { DefaultFilterCriteria } from '../../../../../enums/default-filter-criteria.enum';
import { addFilter } from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';

import './filterInput.css';

export default function FilterInput() {
	const dispatch = useDispatch();

	const defaultCriteria = Object.values(DefaultFilterCriteria);

	const { trackerId } = useSelector((state: RootState) => state.userSettings);

	const { data, error, isLoading } = useGetTrackerSchemaQuery(trackerId);

	return (
		<div>
			<Formik
				initialValues={{ category: 'Team', value: '' }}
				validate={(values) => {}}
				onSubmit={(values, { setFieldValue }) => {
					const filter = {
						slug:
							data?.find(
								(d) =>
									d.trackerItemField == values.category ||
									d.legacyRestName == values.category
							)?.name ?? values.category,
						fieldName: values.category,
						value: values.value,
					};
					dispatch(addFilter(filter));
					setFieldValue('value', '');
				}}
			>
				{({ values, errors, touched, handleSubmit }) => (
					<form onSubmit={handleSubmit}>
						<label className="form-group-label">Filter</label>
						<div className="input-group">
							<Field
								as="select"
								name="category"
								className="select two-fourth"
								data-test="category-select"
							>
								<option value="" disabled>
									----- Default-Fields -----
								</option>
								{defaultCriteria.map((dc, i) => (
									<option key={i} value={dc}>
										{dc}
									</option>
								))}
								<option
									value="-"
									disabled
									title="Below fields are auto-generated from the Tracker's schema and might not always work"
								>
									----- Tracker-Fields -----
								</option>
								{data &&
									data.map((d, i) => (
										<option
											key={i}
											value={
												d.trackerItemField ??
												d.legacyRestName
											}
										>
											{d.name}
										</option>
									))}
							</Field>
							<Field
								type="text"
								name="value"
								className="input three-fourth"
								data-test="value-input"
							></Field>
							<span
								className={`input-decoration input-action clickable ${
									!values.value && 'input-action-disabled'
								}`}
							>
								<button
									type="submit"
									className="button-icon button-icon-small icon-filters borderless"
									title="Add Filter"
									disabled={!values.value}
									data-test="submit"
								></button>
							</span>
						</div>
					</form>
				)}
			</Formik>
		</div>
	);
}
