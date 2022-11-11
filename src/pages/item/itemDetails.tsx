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
	EDITABLE_ATTRIBUTES,
	STORY_POINTS_FIELD_NAME,
	SUBJECT_FIELD_NAME,
	TEAM_FIELD_NAME,
	VERSION_FIELD_NAME,
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
	const [disabledFields, setDisabledFields] = useState<
		{
			key: string;
			value: boolean;
		}[]
	>([]);

	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { trackerId } = useSelector((state: RootState) => state.userSettings);

	const [triggerTrackerSchemaQuery, trackerSchemaQueryResult] =
		useLazyGetTrackerSchemaQuery();
	const [triggerItemQuery, itemQueryResult] = useLazyGetItemQuery();
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

	/**
	 * {@link cbAddress} and {@link storeIsInitializing} subscription
	 *
	 * Will run its logic only once both values are truthy, which will then
	 * claim the store to be initialized and trigger the Item- and TrackerSchema queries
	 */
	React.useEffect(() => {
		if (cbAddress && storeIsInitializing) {
			// console.log('Cb address truthy: ', cbAddress);
			setStoreIsInitializing(false);
			triggerItemQuery(itemId!);
			triggerTrackerSchemaQuery(trackerId);
		}
	}, [cbAddress, storeIsInitializing]);

	/**
	 * Handler for when we receive the tracker schema (or an error when trying to load it)
	 *
	 * Will loop over the {@link EDITABLE_ATTRIBUTES} if we have a schema, and check which of these attributes have a counterpart
	 * in the current tracker (meaning either the "trcakerItemField" or "legacyRestName" match the attribute's respective values).
	 *
	 * Updates {@link disabledFields} with these findings, which can then be used to disable / hide the inputs which this tracker doesn't have a field for.
	 */
	React.useEffect(() => {
		if (trackerSchemaQueryResult.error) {
			console.error(
				"Failed loading Tracker Schema - Won't be able to propose any options"
			);
			//TODO error notif
		} else if (trackerSchemaQueryResult.data) {
			//*register disabledFields - so that fields that don't exist on this tracker are disabled / don't show up
			const disabledFields = [];
			for (let attr of EDITABLE_ATTRIBUTES) {
				disabledFields.push({
					key: attr.name,
					value: !trackerSchemaQueryResult.data.some(
						(d) =>
							d.trackerItemField == attr.name ||
							d.legacyRestName == attr.legacyName
					),
				});
				setDisabledFields(disabledFields);
			}
		}
	}, [trackerSchemaQueryResult]);

	/**
	 * {@link itemQueryResult} subscription
	 *
	 * Sets the item's data and will also update the card for it.
	 */
	React.useEffect(() => {
		if (itemQueryResult.error) {
			//TODO
		} else if (itemQueryResult.data) {
			setItem(itemQueryResult.data);
			updateAppCard(itemQueryResult.data, cardId);
		}
	}, [itemQueryResult]);

	/**
	 * Will trigger fetching options (tracker/{id}/field/{id}/options) for given field
	 *
	 * Mind that triggering this again before the previous response has been received & processed will
	 * cancel the ongoing one, since they're using the same api endpoint implementation.
	 *
	 * @param fieldName Name of the field
	 * @returns void, see the respective effect for how the query's result is handled
	 */
	const fetchOptions = (fieldName: string) => {
		//*if already loaded, return. we get all options at once - no further lazy loading
		if (
			selectOptions.find((o) => o.key == fieldName) ||
			disabledFields.find((f) => f.key == fieldName)?.value
		) {
			return;
		}
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

	/**
	 * {@link fieldOptionsQueryResult} error subscription
	 */
	React.useEffect(() => {
		if (fieldOptionsQueryResult.error) {
			console.error(fieldOptionsQueryResult.error);
			//TODO display
		}
	}, [fieldOptionsQueryResult.error]);

	/**
	 * {@link fieldOptionsQueryResult} data update subscription
	 *
	 * Will update the {@link selectOptions} with the here-received options for the field the request was made for.
	 */
	React.useEffect(() => {
		if (fieldOptionsQueryResult.data) {
			const fieldId = fieldOptionsQueryResult.originalArgs?.fieldId;
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
	}, [fieldOptionsQueryResult.data]);

	/**
	 * @returns Whether the field for {@link fieldName} should be disabled (true) or not (false)
	 */
	const fieldIsDisabled = (fieldName: string): boolean => {
		return disabledFields.find((f) => f.key == fieldName)?.value ?? false;
	};

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
							getOptionLabel={(option) => option.name}
							getOptionValue={(option) => option.id}
							isLoading={fieldOptionsQueryResult.isFetching}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							isDisabled={
								!trackerSchemaQueryResult.data ||
								fieldIsDisabled(ASSIGNEE_FIELD_NAME)
							}
							onChange={(values) =>
								formik.setFieldValue(
									ASSIGNEE_FIELD_NAME,
									values
								)
							}
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
							getOptionLabel={(option) => option.name}
							getOptionValue={(option) => option.id}
							isLoading={fieldOptionsQueryResult.isFetching}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							isDisabled={
								!trackerSchemaQueryResult.data ||
								fieldIsDisabled(TEAM_FIELD_NAME)
							}
							onChange={(values) =>
								formik.setFieldValue(TEAM_FIELD_NAME, values)
							}
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
						onClick={() => fetchOptions(VERSION_FIELD_NAME)}
					>
						<label data-test={VERSION_FIELD_NAME}>Version</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={
								selectOptions.find(
									(s) => s.key == VERSION_FIELD_NAME
								)?.values || []
							}
							getOptionLabel={(option) => option.name}
							getOptionValue={(option) => option.id}
							isLoading={fieldOptionsQueryResult.isFetching}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							isDisabled={
								!trackerSchemaQueryResult.data ||
								fieldIsDisabled(VERSION_FIELD_NAME)
							}
							onChange={(values) =>
								formik.setFieldValue(VERSION_FIELD_NAME, values)
							}
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
						onClick={() => fetchOptions(SUBJECT_FIELD_NAME)}
					>
						<label data-test={SUBJECT_FIELD_NAME}>Subject</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={
								selectOptions.find(
									(s) => s.key == SUBJECT_FIELD_NAME
								)?.values || []
							}
							getOptionLabel={(option) => option.name}
							getOptionValue={(option) => option.id}
							isLoading={fieldOptionsQueryResult.isFetching}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							isDisabled={
								!trackerSchemaQueryResult.data ||
								fieldIsDisabled(SUBJECT_FIELD_NAME)
							}
							onChange={(values) =>
								formik.setFieldValue(SUBJECT_FIELD_NAME, values)
							}
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
							className="input"
							name={STORY_POINTS_FIELD_NAME}
							value={formik.values.storyPoints}
							onChange={(e) =>
								formik.setFieldValue(
									STORY_POINTS_FIELD_NAME,
									e.target.value
								)
							}
							disabled={
								!trackerSchemaQueryResult.data ||
								fieldIsDisabled(STORY_POINTS_FIELD_NAME)
							}
							data-test={STORY_POINTS_FIELD_NAME}
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
