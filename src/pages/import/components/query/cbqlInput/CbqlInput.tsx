import { Field, Formik } from 'formik';
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
		<div className="fade-in-quick">
			<Formik
				initialValues={{
					cbql: cbqlString,
				}}
				enableReinitialize={true}
				validate={(values) => {}}
				onSubmit={async (values) => {
					dispatch(setCbqlString(values.cbql));
				}}
			>
				{({ values, errors, touched, handleSubmit, isSubmitting }) => (
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label>CBQL Input</label>
							<div className="input-group">
								<Field
									type="text"
									name="cbql"
									className="input"
									data-test="cbql"
								/>
								<span className="input-decoration input-action clickable">
									<button
										type="submit"
										className="button-icon button-icon-small icon-invitation borderless"
										title="Query"
										data-test="submit"
									></button>
								</span>
							</div>
						</div>
					</form>
				)}
			</Formik>
		</div>
	);
}
