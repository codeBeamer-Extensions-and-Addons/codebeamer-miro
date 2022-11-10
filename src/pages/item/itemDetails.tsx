import { Field, useFormik } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useLazyGetUsersQuery } from '../../api/codeBeamerRestApi';
import { useLazyGetItemQuery } from '../../api/codeBeamerSwaggerApi';
import { updateAppCard } from '../../api/miro.api';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import { loadBoardSettings } from '../../store/slices/boardSettingsSlice';
import { RootState } from '../../store/store';

//It's 367 wide, really.
const PANEL_WIDTH = 500;

interface Errors {
	assignedTo?: string;
	teams?: string;
	storyPoints?: string;
	versions?: string;
	subjects?: string;
}

/**
 * @param props Props are only used in testing - the values are passed via url query params else.
 */
export default function ItemDetails(props: {
	itemId?: string;
	cardId?: string;
}) {
	const dispatch = useDispatch();
	const [itemId] = useState<string>(
		props.itemId ??
			new URL(document.location.href).searchParams.get('itemId') ??
			''
	);
	const [cardId] = useState<string>(
		props.cardId ??
			new URL(document.location.href).searchParams.get('cardId') ??
			''
	);
	const [storeIsInitializing, setStoreIsInitializing] =
		useState<boolean>(true);
	const [item, setItem] = useState<CodeBeamerItem>();

	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const [triggerItemQuery, itemQueryResult, itemQueryLastPromiseInfo] =
		useLazyGetItemQuery();
	const [triggerUserQuery, userQueryResult, userQueryLastPromiseInfo] =
		useLazyGetUsersQuery();

	React.useEffect(() => {
		if (!itemId || !cardId) {
			console.error(
				'Item page called without itemId and/or cardId in query.'
			);
			return;
		}
		// console.log('Dispatchign board setting load');
		dispatch(loadBoardSettings());
		if (cbAddress) {
			// console.log('Cb address truthy: ', cbAddress);
			setStoreIsInitializing(false);
			triggerItemQuery(itemId!);
		}
	}, []);

	React.useEffect(() => {
		// console.log('cbAddress effect');
		if (cbAddress) {
			setStoreIsInitializing(false);
			triggerItemQuery(itemId!);
		}
	}, [cbAddress]);

	React.useEffect(() => {
		if (itemQueryResult.error) {
			//TODO
		} else if (itemQueryResult.data) {
			setItem(itemQueryResult.data);
			updateAppCard(itemQueryResult.data, cardId);
		}
	}, [itemQueryResult]);

	const updateValues = (attr: string, value: any) => {
		console.log(`Update ${attr} to ${value}`);
	};

	const fetchUsers = (
		inputValue: string,
		callback: (options: any) => void
	) => {
		triggerUserQuery(inputValue);
		console.log('Triggered user query..');
		while (userQueryResult.isFetching || !userQueryResult.data) {
			if (userQueryResult.error) {
				console.log(userQueryResult.error);
				break;
			}
		}
		console.log('No longer fetching..');
		callback(userQueryResult.data);
	};

	const formik = useFormik({
		initialValues: {
			assignedTo: [],
			teams: [],
			storyPoints: -1,
			versions: [],
			subjects: [],
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: Errors = {};

			return errors;
		},
		onSubmit: (values, { setSubmitting }) => {
			setSubmitting(true);
			//TODO trigger POST
		},
	});

	return (
		<>
			{storeIsInitializing ||
				(itemQueryResult.isLoading && (
					<div className="centered loading-spinner"></div>
				))}
			<div className="fade-in centered-horizontally">
				<h3 className="h3">
					Item {itemId} / Widget {cardId}
				</h3>

				<form onSubmit={formik.handleSubmit}>
					<div
						className={`form-group ${
							formik.touched.assignedTo
								? formik.errors.assignedTo
									? 'error'
									: 'success'
								: ''
						}`}
					>
						<label data-test="assignedTo">Assignee</label>
						<AsyncSelect
							className="basic-single"
							classNamePrefix="select"
							defaultOptions
							loadOptions={fetchUsers}
							isLoading={false}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							onChange={(v) => {
								console.log(v);
							}}
							maxMenuHeight={180}
						/>
					</div>
					<div
						className={`form-group ${
							formik.touched.teams
								? formik.errors.teams
									? 'error'
									: 'success'
								: ''
						}`}
					>
						<label data-test="teams">Teams</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={[]}
							isLoading={false}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							getOptionLabel={(option) => option}
							getOptionValue={(option) => option}
							onChange={(v) => {
								console.log(v);
							}}
							maxMenuHeight={180}
						/>
					</div>
					<div
						className={`form-group ${
							formik.touched.versions
								? formik.errors.versions
									? 'error'
									: 'success'
								: ''
						}`}
					>
						<label data-test="versions">Version</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={[]}
							isLoading={false}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							getOptionLabel={(option) => option}
							getOptionValue={(option) => option}
							onChange={(v) => {
								console.log(v);
							}}
							maxMenuHeight={180}
						/>
					</div>
					<div
						className={`form-group ${
							formik.touched.subjects
								? formik.errors.subjects
									? 'error'
									: 'success'
								: ''
						}`}
					>
						<label data-test="subjects">Subject</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={[]}
							isLoading={false}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							getOptionLabel={(option) => option}
							getOptionValue={(option) => option}
							onChange={(v) => {
								console.log(v);
							}}
							maxMenuHeight={180}
						/>
					</div>
					<div
						className={`form-group ${
							formik.touched.storyPoints
								? formik.errors.storyPoints
									? 'error'
									: 'success'
								: ''
						}`}
					>
						<label>Story Points</label>
						<input
							type="number"
							name="storyPoints"
							value={formik.values.storyPoints}
							className="input"
							onChange={(e) => formik.handleChange(e)}
							data-test="storyPoints"
						/>
					</div>
					<div className="flex-centered mt-4">
						{true && (
							<button
								type="submit"
								disabled={formik.isSubmitting}
								data-test="submit"
								className={`fade-in button button-primary ${
									formik.isSubmitting ? 'button-loading' : ''
								}`}
							>
								Save
							</button>
						)}
						{false && (
							<span>
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
			</div>
		</>
	);
}
