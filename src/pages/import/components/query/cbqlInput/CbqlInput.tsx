import { Formik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCbqlString } from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';

export default function CbqlInput() {
	const dispatch = useDispatch();

	const { cbqlString } = useSelector(
		(state: RootState) => state.userSettings
	);

	return (
		<div>
			<Formik
				initialValues={{
					cbql: cbqlString,
				}}
				validate={(values) => {}}
				onSubmit={async (values, { setSubmitting }) => {
					setSubmitting(true);
					dispatch(setCbqlString(values.cbql));
				}}
			>
				{({ values, errors, touched, handleSubmit, isSubmitting }) => (
					<form onSubmit={handleSubmit}>
						<input
							type="text"
							name="cbql"
							className="input"
							data-test="cbql"
						/>
						{/** TODO some neat submit button at the input's end, ya know */}
					</form>
				)}
			</Formik>
		</div>
	);
}
