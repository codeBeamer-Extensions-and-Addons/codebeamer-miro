import { Field, Formik } from 'formik';
import * as React from 'react';
import Header from './header';
import CodeBeamerService from '../api/codebeamer.service';

import './auth.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setCbAddress, setCredentials } from '../store/apiConnectionSlice';

interface Errors {
	cbAddress?: string;
	cbUsername?: string;
	cbPassword?: string;
}

export default function AuthForm() {
	//TODO will have to move up a component to trigger conditional logic
	const cb: CodeBeamerService = CodeBeamerService.getInstance();

	const { cbAddress, cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.apiConnection
	);
	const dispatch = useDispatch();

	return (
		<>
			<Header centered={true}>
				CodeBeamer / Miro Integration
				<br />
				<small>
					<span className="icon icon-plug pos-adjusted-down"></span>{' '}
					Connect to your CodeBeamer Instance
				</small>
			</Header>
			<div>
				<Formik
					initialValues={{
						cbAddress: cbAddress,
						cbUsername: cbUsername,
						cbPassword: cbPassword,
					}}
					validate={(values) => {
						const errors: Errors = {};

						if (!values.cbAddress) errors.cbAddress = 'Required';
						else if (values.cbAddress) {
							const regex = /^https?:\/\/[a-z0-9\.]*\/cb$/;
							if (!values.cbAddress.match(regex))
								errors.cbAddress =
									'Not a valid CB Address! Must specify the protocol (HTTP(S)) and end with /cb';
						}
						if (!values.cbUsername) errors.cbUsername = 'Required';
						if (!values.cbPassword) errors.cbPassword = 'Required';

						if (Object.keys(errors).length) {
							return errors;
						}
					}}
					onSubmit={async (values, { setSubmitting }) => {
						setSubmitting(true);
						console.log('onSubmit');

						dispatch(
							setCredentials({
								username: values.cbUsername,
								password: values.cbPassword,
							})
						);
						dispatch(setCbAddress(values.cbAddress));

						try {
							await cb.getCodeBeamerUser(
								values.cbAddress,
								values.cbUsername,
								values.cbPassword
							);
							alert('Submitted');
						} catch (error: any) {
							alert(
								"Couldn't establish connection. Please check the values and try again. See console for full error."
							);
							console.error(error);
						}
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
								className={`form-group ${
									touched.cbAddress
										? errors.cbAddress
											? 'error'
											: 'success'
										: ''
								}`}
							>
								<label>CodeBeamer Address</label>
								<Field
									type="text"
									name="cbAddress"
									className="input"
								/>
								{errors.cbAddress && touched.cbAddress && (
									<div className="status-text">
										{errors.cbAddress}
									</div>
								)}
							</div>

							<div
								className={`form-group ${
									touched.cbUsername && errors.cbUsername
										? 'error'
										: ''
								}`}
							>
								<label>CB Username</label>
								<Field
									type="text"
									name="cbUsername"
									className="input"
								/>
								{errors.cbUsername && touched.cbUsername && (
									<div className="status-text">
										{errors.cbUsername}
									</div>
								)}
							</div>

							<div
								className={`form-group ${
									touched.cbPassword && errors.cbPassword
										? 'error'
										: ''
								}`}
							>
								<label>CB Password</label>
								<Field
									type="password"
									name="cbPassword"
									className="input"
								/>
								{errors.cbPassword && touched.cbPassword && (
									<div className="status-text">
										{errors.cbPassword}
									</div>
								)}
							</div>

							<div className="flex-centered">
								<button
									type="submit"
									disabled={isSubmitting}
									className={`button button-primary ${
										isSubmitting ? 'button-loading' : ''
									}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="custom-icon pos-adjusted-down"
										viewBox="0 0 512 512"
									>
										<path
											d="M380.93 57.37A32 32 0 00358.3 48H94.22A46.21 46.21 0 0048 94.22v323.56A46.21 46.21 0 0094.22 464h323.56A46.36 46.36 0 00464 417.78V153.7a32 32 0 00-9.37-22.63zM256 416a64 64 0 1164-64 63.92 63.92 0 01-64 64zm48-224H112a16 16 0 01-16-16v-64a16 16 0 0116-16h192a16 16 0 0116 16v64a16 16 0 01-16 16z"
											fill="none"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="32"
										/>
									</svg>
									Save
								</button>
							</div>
						</form>
					)}
				</Formik>
			</div>
		</>
	);
}
