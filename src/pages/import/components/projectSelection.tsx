import { Field, Formik } from 'formik';
import * as React from 'react';
import Header from '../../../components/header';

export default function ProjectSelection() {
	return (
		<div className="container">
			<Header centered={true}>
				Project selection
				<br />
				<small>
					Enter your Project's ID or select it from the Dropdown
					below.
				</small>
			</Header>
			<div className="mt-3">
				<Formik
					initialValues={{
						projectId: 0,
						project: 'this',
					}}
					validate={(values) => {
						const errors: { projectId?: string; project?: string } =
							{};

						if (!values.projectId)
							errors.projectId = 'Select an ID';
						if (!values.project)
							errors.project = "Can't find Project";

						return errors;
					}}
					onSubmit={(values, { setSubmitting }) => {
						setSubmitting(true);

						//TODO dispatch some stuff
					}}
				>
					{({
						values,
						errors,
						touched,
						handleChange,
						handleBlur,
						handleSubmit,
						isSubmitting,
						/* and other goodies */
					}) => (
						<form onSubmit={handleSubmit}>
							<div
								className={`form-group flex align-items-center w-100 ${
									touched.projectId
										? errors.projectId
											? 'error'
											: 'success'
										: ''
								}`}
							>
								<label className="inline">Project ID: </label>
								<Field
									type="number"
									name="projectId"
									className="input w-25 ml-1"
									data-test="projectId"
								/>
								{errors.projectId && touched.projectId && (
									<div className="status-text">
										{errors.projectId}
									</div>
								)}
							</div>
							<div
								className={`form-group w-fill ${
									touched.project
										? errors.project
											? 'error'
											: 'success'
										: ''
								}`}
							>
								<label className="inline">Project</label>
								<Field
									as="select"
									name="project"
									className="input w-100"
									data-test="project"
								>
									<option value="this">This</option>
									<option value="that">That</option>
								</Field>
								{errors.project && touched.project && (
									<div className="status-text">
										{errors.project}
									</div>
								)}
							</div>
							<div className="flex-centered mt-3">
								<button
									type="submit"
									disabled={isSubmitting}
									className={`button button-primary ${
										isSubmitting && 'button-loading'
									}`}
									data-test="submit"
								>
									Confirm
								</button>
							</div>
						</form>
					)}
				</Formik>
			</div>
		</div>
	);
}
