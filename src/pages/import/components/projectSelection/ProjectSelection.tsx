import { Field, Formik, useFormikContext } from 'formik';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useGetProjectsQuery } from '../../../../api/codeBeamerApi';
import Header from '../../../../components/header';
import { ProjectListView } from '../../../../models/projectListView.if';
import { setProjectId } from '../../../../store/slices/boardSettingsSlice';

export default function ProjectSelection() {
	const dispatch = useDispatch();

	const { data, error, isLoading } = useGetProjectsQuery();

	React.useEffect(() => {
		if (error) {
			console.error(error);
			//TODO miro.showErrorNotif
		}
	}, [error]);

	return (
		<div data-test="project-selection" className="container">
			<Header centered={true} margin={true}>
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
						project: '-',
					}}
					validate={(values) => {
						const errors: { projectId?: string; project?: string } =
							{};

						if (!values.projectId)
							errors.projectId = 'Select an ID';
						// if (!values.project || values.project == '-')
						// 	errors.project = "Can't find Project";
						if (
							data &&
							!data.find((p) => p.id == values.projectId)
						) {
							errors.projectId = 'No Project found with this ID';
						}

						return errors;
					}}
					onSubmit={(values, { setSubmitting }) => {
						setSubmitting(true);

						dispatch(setProjectId(values.projectId));
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
								<ProjectIdField />
								{errors.projectId && touched.projectId && (
									<div
										className="status-text ml-1"
										data-test="projectIdErrors"
									>
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
								<ProjectField
									projects={data}
									loading={isLoading}
								/>
								{errors.project && (
									<div className="status-text">
										{errors.project}
									</div>
								)}
							</div>
							<div className="flex-centered mt-4">
								<button
									type="submit"
									disabled={
										isSubmitting ||
										errors.project ||
										errors.projectId
									}
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

const ProjectField = (props: {
	projects: ProjectListView[] | undefined;
	loading: boolean;
}) => {
	const {
		values: { projectId },
		setFieldValue,
	} = useFormikContext<{ projectId: number }>();

	React.useEffect(() => {
		//to add a 2nd error msg below this input, which I think is obsolete
		//&& props.projects?.find((p) => p.id == projectId)
		if (projectId !== 0) {
			setFieldValue('project', projectId);
		} else {
			setFieldValue('project', '-');
		}
	}, [projectId]);

	return (
		<Field
			as="select"
			name="project"
			className="select w-100"
			data-test="project"
		>
			<option value="-">--</option>
			{props.loading && <option>Loading Projects...</option>}
			{!props.loading &&
				props.projects?.map((p) => {
					return (
						<option value={p.id} key={p.id}>
							{p.name}
						</option>
					);
				})}
		</Field>
	);
};

const ProjectIdField = () => {
	const {
		values: { project },
		setFieldValue,
	} = useFormikContext<{ project: string }>();

	React.useEffect(() => {
		if (project !== '-') {
			setFieldValue('projectId', parseInt(project));
		}
	}, [project]);

	return (
		<Field
			type="number"
			name="projectId"
			className="input w-25 ml-1"
			data-test="projectId"
		/>
	);
};
