import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import {
	useLazyGetItemQuery,
	useLazyGetFilteredUsersQuery,
	useLazyGetItemsQuery,
	useGetTrackerSchemaQuery,
	useLazyGetFieldOptionsQuery,
	useLazyGetTrackerSchemaQuery,
} from '../../api/codeBeamerApi';
import { updateAppCard } from '../../api/miro.api';
import {
	ASSIGNEE_FIELD_NAME,
	TEAM_FIELD_NAME,
} from '../../constants/editable-attributes';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import { loadBoardSettings } from '../../store/slices/boardSettingsSlice';
import { RootState } from '../../store/store';

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

	const [selectOptions, setSelectOptions] = useState<
		{ key: string; values: any[] }[]
	>([]);

	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { trackerId } = useSelector((state: RootState) => state.userSettings);

	const [triggerTrackerSchemaQuery, trackerSchemaQueryResult] =
		useLazyGetTrackerSchemaQuery();
	const [triggerItemQuery, itemQueryResult] = useLazyGetItemQuery();
	const [triggerUserQuery, userQueryResult] = useLazyGetFilteredUsersQuery();
	const [triggerItemsQuery, itemsQueryResult] = useLazyGetItemsQuery();
	const [triggerFieldOptionsQuery, fieldOptionsQueryResult] =
		useLazyGetFieldOptionsQuery();

	React.useEffect(() => {
		if (!itemId || !cardId) {
			console.error(
				'Item page called without itemId and/or cardId in query.'
			);
			return;
		}
		dispatch(loadBoardSettings());
	}, []);

	React.useEffect(() => {
		if (cbAddress && storeIsInitializing) {
			// console.log('Cb address truthy: ', cbAddress);
			setStoreIsInitializing(false);
			triggerItemQuery(itemId!);
			triggerTrackerSchemaQuery(trackerId);
		}
	});

	React.useEffect(() => {
		if (trackerSchemaQueryResult.error) {
			console.error(
				"Failed loading Tracker Schema - Won't be able to propose any options"
			);
			//TODO
		}
	}, [trackerSchemaQueryResult]);

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

	// React.useEffect(() => {
	// 	if (userQueryResult.error) {
	// 		console.error(userQueryResult.error);
	// 	} else if (userQueryResult.data) {
	// 		const neoOptions = [
	// 			...selectOptions.filter((s) => s.key !== ASSIGNEE_FIELD_NAME),
	// 			{
	// 				key: ASSIGNEE_FIELD_NAME,
	// 				values: userQueryResult.data.users,
	// 			},
	// 		];
	// 		setSelectOptions(neoOptions);
	// 	}
	// }, [userQueryResult]);

	//TODO make generic
	const fetchOptions = (fieldName: string) => {
		//*if already loaded, return. we get all options at once - no further lazy loading
		if (selectOptions.find((o) => o.key == fieldName)) return;
		if (!trackerSchemaQueryResult.data) {
			return;
		}
		const fieldId = trackerSchemaQueryResult.data.find(
			(d) => d.trackerItemField == fieldName
		)?.id;
		if (!fieldId) {
			//TODO error: can't load options
			console.warn(
				"Can't find field for assignee in Tracker schema - therefore can't load options."
			);
			return;
		}
		console.log('Triggering field options query with', {
			trackerId: trackerId,
			fieldId: fieldId,
		});
		triggerFieldOptionsQuery({ trackerId, fieldId });
	};

	React.useEffect(() => {
		if (fieldOptionsQueryResult.error) {
			console.log(fieldOptionsQueryResult.error);
			//TODO display
		}
		if (fieldOptionsQueryResult.data) {
			const fieldId = fieldOptionsQueryResult.originalArgs?.fieldId;
			console.log('OriginalArg fieldId: ', fieldId);
			if (!fieldId) {
				console.warn(
					"Can't determine which field the received data are options for."
				);
			} else {
				const fieldName = trackerSchemaQueryResult.data?.find(
					(d) => d.id == fieldId
				)?.trackerItemField;
				if (!fieldName) {
					console.warn(
						"Can't determine which field the received data are options for."
					);
					return;
				}
				console.log(
					'Setting following options for field ',
					fieldName,
					fieldOptionsQueryResult.data
				);
				const options = [
					...selectOptions.filter((s) => s.key !== fieldName),
					{
						key: fieldName,
						values: fieldOptionsQueryResult.data,
					},
				];
				setSelectOptions(options);
			}
		}
	}, [fieldOptionsQueryResult]);

	//*********************************************************************** */
	//********************************RENDER********************************* */
	//*********************************************************************** */

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
					{
						//*********************************************************************** */
						//********************************ASSIGNEE******************************* */
						//*********************************************************************** */
					}
					<div
						className={`form-group ${
							formik.touched.assignedTo
								? formik.errors.assignedTo
									? 'error'
									: 'success'
								: ''
						}`}
						onClick={() => fetchOptions(ASSIGNEE_FIELD_NAME)}
					>
						<label data-test={ASSIGNEE_FIELD_NAME}>Assignee</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={
								selectOptions.find(
									(s) => s.key == ASSIGNEE_FIELD_NAME
								)?.values || []
							}
							getOptionLabel={(o) => o.name}
							getOptionValue={(o) => o.id}
							isLoading={fieldOptionsQueryResult.isFetching}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							onChange={(v) => {
								console.log('Values: ', v);
								formik.setFieldValue(ASSIGNEE_FIELD_NAME, v);
							}}
							maxMenuHeight={180}
						/>
					</div>

					{
						//*********************************************************************** */
						//********************************TEAM*********************************** */
						//*********************************************************************** */
					}
					<div
						className={`form-group ${
							formik.touched.teams
								? formik.errors.teams
									? 'error'
									: 'success'
								: ''
						}`}
						onClick={() => fetchOptions(TEAM_FIELD_NAME)}
					>
						<label data-test={TEAM_FIELD_NAME}>Team</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={
								selectOptions.find(
									(s) => s.key == TEAM_FIELD_NAME
								)?.values || []
							}
							isLoading={false}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							getOptionLabel={(option) => option}
							getOptionValue={(option) => option}
							onChange={(v) => {
								const values = v.map((val) => {
									return {
										id: val.id,
										name: val.name,
									};
								});
								formik.setFieldValue(TEAM_FIELD_NAME, values);
							}}
							maxMenuHeight={180}
						/>
					</div>

					{
						//*********************************************************************** */
						//********************************VERSION******************************** */
						//*********************************************************************** */
					}

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

					{
						//*********************************************************************** */
						//********************************SUBJECT******************************** */
						//*********************************************************************** */
					}

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

					{
						//*********************************************************************** */
						//********************************STORY POINTS*************************** */
						//*********************************************************************** */
					}
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

					{
						//*********************************************************************** */
						//********************************SUBMIT********************************* */
						//*********************************************************************** */
					}

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
