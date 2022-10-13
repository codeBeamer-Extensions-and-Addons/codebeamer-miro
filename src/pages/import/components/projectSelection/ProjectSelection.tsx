import Select from 'react-select';
import * as React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetProjectsQuery } from '../../../../api/codeBeamerApi';
import { ProjectListView } from '../../../../models/projectListView.if';
import { displayAppMessage } from '../../../../store/slices/appMessagesSlice';
import { setProjectId } from '../../../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../store/store';

import './projectSelection.css';

export default function ProjectSelection(props: { headerLess?: boolean }) {
	const dispatch = useDispatch();

	const [animateSuccess, setAnimateSuccess] = useState(false);
	const [selectedProjectId, setSelectedProjectId] = useState<
		string | number
	>();

	const { cbAddress, projectId } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const [selectedProjectLabel, setSelectedProjectLabel] = useState<string>(
		projectId.toString()
	);

	const [trigger, result, lastPromiseInfo] =
		useLazyGetProjectsQuery(projectId);

	React.useEffect(() => {
		trigger();
	}, [cbAddress]);

	React.useEffect(() => {
		if (result.isError) {
			console.error(result.error);
			dispatch(
				displayAppMessage({
					header: 'Error fetching Projects',
					content: `Is your codeBeamer server accessible?`,
					bg: 'danger',
					delay: 5000,
				})
			);
		}
	}, [result]);

	React.useEffect(() => {
		if (result.data) {
			setSelectedProjectLabel(
				result.data.find((r) => r.id == projectId)?.name ??
					projectId.toString()
			);
		}
	}, [result.data]);

	const showSuccessAnimation = () => {
		setAnimateSuccess(true);
		setTimeout(() => {
			setAnimateSuccess(false);
		}, 2000);
	};

	return (
		<div
			data-test="project-selection"
			className="container project-selection"
		>
			{!props.headerLess && (
				<header className="text-center mb-5">
					<h3 className="h3">Project selection</h3>
					<p>
						Select your Project
						<br />
						{selectedProjectLabel && (
							<span data-test="current-project">
								Currently: {selectedProjectLabel}
							</span>
						)}
					</p>
				</header>
			)}
			<div className="mt-3">
				<Select
					className="basic-single"
					classNamePrefix="select"
					options={result.data}
					isLoading={result.isLoading}
					isSearchable={true}
					isClearable={true}
					getOptionLabel={(option) => option.name}
					getOptionValue={(option) => option.id.toString()}
					onChange={(v) => {
						setSelectedProjectId(v?.id);
					}}
					maxMenuHeight={180}
				/>
				<span className="muted-medium" data-test="cb-context">
					Projects from: {cbAddress}
				</span>
				<div className="flex-centered mt-4">
					{!animateSuccess && (
						<button
							type="submit"
							disabled={!selectedProjectId}
							className="fade-in button button-primary"
							data-test="submit"
							onClick={() => {
								if (!selectedProjectId) {
									dispatch(
										displayAppMessage({
											header: 'No value provided for the Project',
											content:
												'This is probably due to an internal error. Please contact support!',
											bg: 'danger',
										})
									);
									return;
								}
								dispatch(setProjectId(selectedProjectId));
								dispatch(setTrackerId(''));

								showSuccessAnimation();
							}}
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
			</div>
		</div>
	);
}
