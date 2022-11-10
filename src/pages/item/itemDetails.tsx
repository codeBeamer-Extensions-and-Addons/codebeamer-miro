import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import {
	useLazyGetItemQuery,
	useLazyGetFilteredUsersQuery,
	useLazyGetItemsQuery,
} from '../../api/codeBeamerApi';
import { updateAppCard } from '../../api/miro.api';
import {
	ASSIGNEE_TECHNICAL_NAME,
	TEAM_TECHNICAL_NAME,
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

	const [triggerItemQuery, itemQueryResult] = useLazyGetItemQuery();
	const [triggerUserQuery, userQueryResult] = useLazyGetFilteredUsersQuery();
	const [triggerItemsQuery, itemsQueryResult] = useLazyGetItemsQuery();

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

	React.useEffect(() => {
		if (userQueryResult.error) {
			console.error(userQueryResult.error);
		} else if (userQueryResult.data) {
			const neoOptions = [
				...selectOptions.filter(
					(s) => s.key !== ASSIGNEE_TECHNICAL_NAME
				),
				{
					key: ASSIGNEE_TECHNICAL_NAME,
					values: userQueryResult.data.users,
				},
			];
			setSelectOptions(neoOptions);
		}
	}, [userQueryResult]);

	const fetchUsers = (inputValue: string) => {
		triggerUserQuery(inputValue);
	};

	const fetchOptions = (field: string) => {
		triggerItemsQuery({
			page: 1,
			pageSize: 50,
			queryString: '',
		});
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
					>
						<label data-test={ASSIGNEE_TECHNICAL_NAME}>
							Assignee
						</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={
								selectOptions.find(
									(s) => s.key == ASSIGNEE_TECHNICAL_NAME
								)?.values || []
							}
							getOptionLabel={(o) => o.name}
							getOptionValue={(o) => o.uri}
							isLoading={false}
							isMulti={true}
							isSearchable={true}
							isClearable={true}
							onInputChange={(v) => fetchUsers(v)}
							onChange={(v) => {
								const values = v.map((val) => {
									return {
										id: val.uri.substring(6),
										uri: val.uri,
										name: val.name,
									};
								});
								formik.setFieldValue(
									ASSIGNEE_TECHNICAL_NAME,
									values
								);
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
						onClick={() => fetchOptions(TEAM_TECHNICAL_NAME)}
					>
						<label data-test={TEAM_TECHNICAL_NAME}>Team</label>
						<Select
							className="basic-single"
							classNamePrefix="select"
							options={
								selectOptions.find(
									(s) => s.key == TEAM_TECHNICAL_NAME
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
								formik.setFieldValue(
									TEAM_TECHNICAL_NAME,
									values
								);
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
