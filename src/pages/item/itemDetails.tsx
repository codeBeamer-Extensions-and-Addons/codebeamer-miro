import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import {
	useLazyGetItemQuery,
	useLazyGetFieldOptionsQuery,
	useLazyGetTrackerSchemaQuery,
	useLazyUpdateItemLegacyQuery,
	useGetItemFieldsQuery,
} from '../../api/codeBeamerApi';
import { updateAppCard } from '../../api/miro.api';
import getRestResourceUri, {
	getIdFromRestResourceUri,
} from '../../api/utils/getRestResourceUri';
import mapToLegacyValue from '../../api/utils/mapToLegacyValue';
import {
	ASSIGNEE_FIELD_NAME,
	EDITABLE_ATTRIBUTES,
	STORY_POINTS_FIELD_NAME,
	SUBJECT_FIELD_NAME,
	TEAM_FIELD_NAME,
	VERSION_FIELD_NAME,
} from '../../constants/editable-attributes';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import { CodeBeamerReferenceMinimal } from '../../models/codebeamer-reference.if';
import { RootState } from '../../store/store';
import { CodeBeamerTrackerSchemaEntry } from '../../models/trackerSchema.if';

import './itemDetails.css';
import ItemSummary from './itemSummary/ItemSummary';
import { CodeBeamerItemFields } from '../../models/api-query-types';

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
export default function ItemDetails(props: { itemId: string; cardId: string }) {
	const [item, setItem] = useState<CodeBeamerItem>();
	const [itemFields, setItemFields] = useState<CodeBeamerItemFields>();

	const [trackerSchema, setTrackerSchema] = useState<
		CodeBeamerTrackerSchemaEntry[]
	>([]);
	const [trackerId, setTrackerId] = useState<string>();
	const [loading, setLoading] = useState<boolean>(true);
	const [animateSuccess, setAnimateSuccess] = useState<boolean>(false);
	const [fatalError, setFatalError] = useState<string>('');

	const [selectOptions, setSelectOptions] = useState<
		{ key: string; values: any[] }[]
	>([]);

	const disabledFields = useDisabledFields(trackerSchema);

	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	//lazy because we want to be able to trigger it on-demand later down the line too.
	//but it will also be fired onMount
	const [triggerItemQuery, itemQueryResult] = useLazyGetItemQuery();

	const {
		data: itemFieldsQueryResult,
		error: itemFieldsQueryError,
		isLoading: itemFieldsQueryIsLoading,
	} = useGetItemFieldsQuery(props.itemId);

	const [triggerTrackerSchemaQuery, trackerSchemaQueryResult] =
		useLazyGetTrackerSchemaQuery();
	const [triggerFieldOptionsQuery, fieldOptionsQueryResult] =
		useLazyGetFieldOptionsQuery();
	const [triggerUpdateItem, updateItemResult] =
		useLazyUpdateItemLegacyQuery();

	/**
	 * On mount, get the Item's data.
	 */
	React.useEffect(() => {
		triggerItemQuery(props.itemId);
	}, []);

	/**
	 * Handler for when we receive the tracker schema (or an error when trying to load it)
	 *
	 * sets the {@link trackerSchema} if it receives one (and not an error)
	 */
	React.useEffect(() => {
		if (trackerSchemaQueryResult.error) {
			console.error(
				"Fatal error - couldn't load tracker schema: ",
				trackerSchemaQueryResult.error
			);
			setFatalError('Failed loading tracker schema');
			return;
		} else if (trackerSchemaQueryResult.data) {
			setTrackerSchema(trackerSchemaQueryResult.data);
			//*eagerly load assignee options, because it tends to take several seconds
			fetchOptions(ASSIGNEE_FIELD_NAME);
			setLoading(false);
		}
	}, [trackerSchemaQueryResult]);

	/**
	 * {@link itemFieldsQueryResult} subscription
	 *
	 * Updates the {@link itemFields} with its values (or sets a {@link fatalError} if it fails.
	 * Will also {@link triggerTrackerSchemaQuery}, if no schema is loaded or loading yet.)
	 */
	React.useEffect(() => {
		if (itemFieldsQueryError) {
			console.error(
				"Fatal error - couldn't load Item data",
				itemFieldsQueryError
			);
			setFatalError(
				`Failed loading Item data from ${cbAddress} for Item with Id ${props.itemId}`
			);
		} else if (itemFieldsQueryResult) {
			//* the Tracker field has Id 1 and should always be readonly in the /fields response
			const trackerId =
				itemFieldsQueryResult.readonlyFields
					.find((f) => f.fieldId == 1 && f.name == 'Tracker')
					?.values[0].id.toString() ??
				itemFieldsQueryResult.editableFields
					.find((f) => f.fieldId == 1 && f.name == 'Tracker')
					?.values[0].id.toString() ??
				null;

			if (!trackerId) {
				console.error(
					"Fatal error - couldn't find the Item's Tracker to load the schema in. Looked for field with Id '1' and name 'Tracker' in ",
					itemFields
				);
				setFatalError(
					`Failed processing Item data - can't find the Item's tracker in its data`
				);
				return;
			}

			setTrackerId(trackerId);
			setItemFields(itemFieldsQueryResult);

			if (
				(!trackerSchema || !trackerSchema.length) &&
				!trackerSchemaQueryResult.isFetching
			) {
				triggerTrackerSchemaQuery(trackerId);
			}
		}
	}, [itemFieldsQueryResult]);

	React.useEffect(() => {
		if (itemQueryResult.error) {
			console.error(
				"Fatal error - couldn't load Item data",
				itemQueryResult.error
			);
			setFatalError(
				`Failed loading Item data from ${cbAddress} for Item with Id ${props.itemId}`
			);
		} else if (itemQueryResult.data) {
			setItem(itemQueryResult.data);
		}
	}, [itemQueryResult]);

	/**
	 * {@link updateItemResult} subscription
	 */
	React.useEffect(() => {
		if (updateItemResult.error) {
			//error logged by rtk handler
		} else if (updateItemResult.data) {
			triggerItemQuery(props.itemId);
			setAnimateSuccess(true);
			setTimeout(() => {
				setAnimateSuccess(false);
			}, 2000);
		}
	}, [updateItemResult]);

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
		//the second can't be true if the first isn't, but the compiler doesn't know that much
		if (!trackerSchemaQueryResult.data || !trackerId) {
			return;
		}
		const fieldId = trackerSchemaQueryResult.data.find(
			(d) => d.trackerItemField == fieldName
		)?.id;
		if (!fieldId) {
			const message = `Can't find field for ${fieldName} in Tracker schema - therefore can't load options.`;
			console.warn(message);
			miro.board.notifications.showError(message);
			return;
		}
		triggerFieldOptionsQuery({ trackerId, fieldId });
	};

	/**
	 * {@link fieldOptionsQueryResult} error subscription
	 */
	React.useEffect(() => {
		if (fieldOptionsQueryResult.error) {
			console.error(fieldOptionsQueryResult.error);
			miro.board.notifications.showError('Failed loading options');
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

	const getFieldLabel = (fieldName: string): string => {
		if (!trackerSchemaQueryResult.data) return fieldName;
		let label = trackerSchemaQueryResult.data.find(
			(r) =>
				r.legacyRestName == fieldName || r.trackerItemField == fieldName
		)?.name;
		return label ?? fieldName;
	};

	/**
	 * @returns Whether the field for {@link fieldName} should be disabled (true) or not (false)
	 */
	const fieldIsDisabled = (fieldName: string): boolean => {
		return disabledFields.find((f) => f.key == fieldName)?.value ?? false;
	};

	/**
	 *
	 * @param fieldName Swagger / v3 name of the field in question
	 * @returns Whether the field in question is of type "array" (ergo allows multiple values) or not.
	 */
	const fieldIsMulti = (fieldName: string): boolean => {
		return (
			trackerSchema.find((f) => f.trackerItemField == fieldName)
				?.multipleValues || false
		);
	};

	//*********************************************************************** */
	//********************************RENDER********************************* */
	//*********************************************************************** */

	const formik = useFormik({
		initialValues: {
			assignedTo: item?.assignedTo
				? (item.assignedTo as CodeBeamerReferenceMinimal[])
				: [],
			teams: item?.teams
				? (item.teams as CodeBeamerReferenceMinimal[])
				: [],
			storyPoints: item?.storyPoints ?? -1,
			versions: item?.versions
				? (item.versions as CodeBeamerReferenceMinimal[])
				: [],
			subjects: item?.subjects
				? (item.subjects as CodeBeamerReferenceMinimal[])
				: [],
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: Errors = {};

			return errors;
		},
		onSubmit: (values) => {
			console.log('Submitting');
			//*mapping in the formik.setFieldValue calls would only affect fields where
			//*something really is updated, but leave the untouched ones in their inadequate structure

			//*mind the keys here; they're legacy field names, since we're using the legacy rest api to do the update
			//*(because the swagger api v3 is disgustingly complicated in that regard)

			const payload = {
				uri: getRestResourceUri(item!.id),
				assignedTo: values.assignedTo.map(mapToLegacyValue),
				team: values.teams.map(mapToLegacyValue),
				versions: values.versions.map(mapToLegacyValue),
				realizedFeature: values.subjects.map(mapToLegacyValue),
				storyPoints: values.storyPoints,
			};

			triggerUpdateItem(payload);
		},
	});

	return (
		<>
			{fatalError && (
				<div className="centered" data-test="fatal-error">
					<h3 className="h3">Fatal error</h3>
					<p>{fatalError}</p>
				</div>
			)}
			{!fatalError && loading && (
				<div className="centered loading-spinner-lg"></div>
			)}
			{!fatalError && !loading && item && (
				<div className="fade-in centered-horizontally h-100 flex-col w-85">
					<div className="panel-header h-max-25">
						<ItemSummary
							item={item}
							canZoomToItem={true}
							cardId={props.cardId}
						/>
					</div>
					<hr />
					<div className="panel-content mt-1 h-64 overflow-auto">
						<h6 className="h6 pb-3">Editable attributes:</h6>
						<form
							onSubmit={formik.handleSubmit}
							className="flex-col position-relative"
						>
							{
								//*********************************************************************** */
								//********************************ASSIGNEE******************************* */
								//*********************************************************************** */
							}
							<div
								hidden={
									!trackerSchemaQueryResult.data ||
									fieldIsDisabled(ASSIGNEE_FIELD_NAME)
								}
								className={`form-group fade-in-quick${
									formik.touched.assignedTo
										? formik.errors.assignedTo
											? 'error'
											: 'success'
										: ''
								}`}
								onClick={() =>
									fetchOptions(ASSIGNEE_FIELD_NAME)
								}
							>
								<label data-test={ASSIGNEE_FIELD_NAME}>
									{getFieldLabel(ASSIGNEE_FIELD_NAME)}
								</label>
								<Select
									className="basic-single"
									classNamePrefix="select"
									options={
										selectOptions.find(
											(s) => s.key == ASSIGNEE_FIELD_NAME
										)?.values || []
									}
									value={formik.values.assignedTo}
									getOptionLabel={(option) => option.name}
									getOptionValue={(option) =>
										option.id
											? option.id.toString()
											: option.uri
											? getIdFromRestResourceUri(
													option.uri
											  )
											: '-1'
									}
									isLoading={
										fieldOptionsQueryResult.isFetching
									}
									isMulti={fieldIsMulti(ASSIGNEE_FIELD_NAME)}
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
								hidden={
									!trackerSchemaQueryResult.data ||
									fieldIsDisabled(TEAM_FIELD_NAME)
								}
								className={`form-group fade-in-quick${
									formik.touched.teams
										? formik.errors.teams
											? 'error'
											: 'success'
										: ''
								}`}
								onClick={() => fetchOptions(TEAM_FIELD_NAME)}
							>
								<label data-test={TEAM_FIELD_NAME}>
									{getFieldLabel(TEAM_FIELD_NAME)}
								</label>
								<Select
									className="basic-single"
									classNamePrefix="select"
									options={
										selectOptions.find(
											(s) => s.key == TEAM_FIELD_NAME
										)?.values || []
									}
									value={formik.values.teams}
									getOptionLabel={(option) => option.name}
									getOptionValue={(option) =>
										option.id
											? option.id.toString()
											: option.uri
											? getIdFromRestResourceUri(
													option.uri
											  )
											: '-1'
									}
									isLoading={
										fieldOptionsQueryResult.isFetching
									}
									isMulti={fieldIsMulti(TEAM_FIELD_NAME)}
									isSearchable={true}
									isClearable={true}
									isDisabled={
										!trackerSchemaQueryResult.data ||
										fieldIsDisabled(TEAM_FIELD_NAME)
									}
									onChange={(values) =>
										formik.setFieldValue(
											TEAM_FIELD_NAME,
											values
										)
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
								hidden={
									!trackerSchemaQueryResult.data ||
									fieldIsDisabled(VERSION_FIELD_NAME)
								}
								className={`form-group fade-in-quick${
									formik.touched.versions
										? formik.errors.versions
											? 'error'
											: 'success'
										: ''
								}`}
								onClick={() => fetchOptions(VERSION_FIELD_NAME)}
							>
								<label data-test={VERSION_FIELD_NAME}>
									{getFieldLabel(VERSION_FIELD_NAME)}
								</label>
								<Select
									className="basic-single"
									classNamePrefix="select"
									options={
										selectOptions.find(
											(s) => s.key == VERSION_FIELD_NAME
										)?.values || []
									}
									value={formik.values.versions}
									getOptionLabel={(option) => option.name}
									getOptionValue={(option) =>
										option.id
											? option.id.toString()
											: option.uri
											? getIdFromRestResourceUri(
													option.uri
											  )
											: '-1'
									}
									isLoading={
										fieldOptionsQueryResult.isFetching
									}
									isMulti={fieldIsMulti(VERSION_FIELD_NAME)}
									isSearchable={true}
									isClearable={true}
									isDisabled={
										!trackerSchemaQueryResult.data ||
										fieldIsDisabled(VERSION_FIELD_NAME)
									}
									onChange={(values) =>
										formik.setFieldValue(
											VERSION_FIELD_NAME,
											values
										)
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
								hidden={
									!trackerSchemaQueryResult.data ||
									fieldIsDisabled(SUBJECT_FIELD_NAME)
								}
								className={`form-group fade-in-quick${
									formik.touched.subjects
										? formik.errors.subjects
											? 'error'
											: 'success'
										: ''
								}`}
								onClick={() => fetchOptions(SUBJECT_FIELD_NAME)}
							>
								<label data-test={SUBJECT_FIELD_NAME}>
									{getFieldLabel(SUBJECT_FIELD_NAME)}
								</label>
								<Select
									className="basic-single"
									classNamePrefix="select"
									options={
										selectOptions.find(
											(s) => s.key == SUBJECT_FIELD_NAME
										)?.values || []
									}
									value={formik.values.subjects}
									getOptionLabel={(option) => option.name}
									getOptionValue={(option) =>
										option.id
											? option.id.toString()
											: option.uri
											? getIdFromRestResourceUri(
													option.uri
											  )
											: '-1'
									}
									isLoading={
										fieldOptionsQueryResult.isFetching
									}
									isMulti={fieldIsMulti(SUBJECT_FIELD_NAME)}
									isSearchable={true}
									isClearable={true}
									isDisabled={
										!trackerSchemaQueryResult.data ||
										fieldIsDisabled(SUBJECT_FIELD_NAME)
									}
									onChange={(values) =>
										formik.setFieldValue(
											SUBJECT_FIELD_NAME,
											values
										)
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
								hidden={
									!trackerSchemaQueryResult.data ||
									fieldIsDisabled(STORY_POINTS_FIELD_NAME)
								}
								className={`form-group fade-in-quick${
									formik.touched.storyPoints
										? formik.errors.storyPoints
											? 'error'
											: 'success'
										: ''
								}`}
							>
								<label>
									{getFieldLabel(STORY_POINTS_FIELD_NAME)}
								</label>
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
						</form>
					</div>
					{
						//*********************************************************************** */
						//********************************SUBMIT********************************* */
						//*********************************************************************** */
					}

					<div className="absolute-bottom">
						{!animateSuccess && (
							<button
								type="submit"
								disabled={updateItemResult.isFetching}
								data-test="submit"
								className={`fade-in button button-primary ${
									updateItemResult.isFetching
										? 'button-loading'
										: ''
								}`}
								onClick={() => formik.handleSubmit()}
							>
								Save
							</button>
						)}
						{animateSuccess && (
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
				</div>
			)}
		</>
	);
}

const useDisabledFields = (trackerSchema: CodeBeamerTrackerSchemaEntry[]) => {
	const [disabledFields, setDisabledFields] = useState<
		{
			key: string;
			value: boolean;
		}[]
	>([]);

	React.useEffect(() => {
		if (!trackerSchema || !trackerSchema.length) return;
		const disabledFields = [];
		for (let attr of EDITABLE_ATTRIBUTES) {
			disabledFields.push({
				key: attr.name,
				value: !trackerSchema.some(
					(entry) =>
						entry.trackerItemField == attr.name ||
						entry.legacyRestName == attr.legacyName
				),
			});
		}
		setDisabledFields(disabledFields);
	}, [trackerSchema]);

	return disabledFields;
};
