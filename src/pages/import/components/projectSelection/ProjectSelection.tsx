import { Field, Formik, useFormikContext } from 'formik';
import * as React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProjectsQuery } from '../../../../api/codeBeamerApi';
import Header from '../../../../components/header/Header';
import { ProjectListView } from '../../../../models/projectListView.if';
import { setProjectId } from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../store/store';

export default function ProjectSelection(props: { headerLess?: boolean }) {
	const dispatch = useDispatch();

	const [animateSuccess, setAnimateSuccess] = useState(false);

	const { projectId } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { data, error, isLoading } = useGetProjectsQuery(projectId);

	React.useEffect(() => {
		if (error) {
			console.error(error);
			//TODO miro.showErrorNotif
		}
	}, [error]);

	const showSuccessAnimation = () => {
		setAnimateSuccess(true);
		setTimeout(() => {
			setAnimateSuccess(false);
		}, 2000);
	};

	return (
		<div data-test="project-selection" className="container">
			{!props.headerLess && (
				<Header centered={true} margin={true}>
					Project selection
					<br />
					<small>
						Enter your Project's ID or select it from the Dropdown
						below.
					</small>
				</Header>
			)}
			<div className="mt-3">
				<Formik
					initialValues={{
						projectId: projectId,
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
						dispatch(setTrackerId(''));

						showSuccessAnimation();

						setSubmitting(false);
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
								{!animateSuccess && (
									<button
										type="submit"
										disabled={
											isSubmitting ||
											errors.project ||
											errors.projectId
										}
										className={`fade-in button button-primary ${
											isSubmitting && 'button-loading'
										}`}
										data-test="submit"
									>
										Confirm
									</button>
								)}
								{animateSuccess && (
									<span data-test="user-feedback">
										<svg
											className="checkmark"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 52 52"
										>
											<circle
												className="checkmark__circle"
												cx="26"
												cy="26"
												r="25"
												fill="none"
											/>
											<path
												className="checkmark__check"
												fill="none"
												d="M14.1 27.2l7.1 7.2 16.7-16.8"
											/>
										</svg>
									</span>
								)}
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
