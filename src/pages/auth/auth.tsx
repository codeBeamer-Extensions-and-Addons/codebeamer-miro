import { Field, Formik } from 'formik';
import * as React from 'react';
import Header from '../../components/header';

import './auth.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setCredentials } from '../../store/slices/userSettingsSlice';
import { setCbAddress } from '../../store/slices/boardSettingsSlice';

interface Errors {
	cbAddress?: string;
	cbUsername?: string;
	cbPassword?: string;
}

export default function AuthForm(props: { loading: boolean; error: any }) {
	const dispatch = useDispatch();

	const { cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.userSettings
	);
	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	if (props.error) {
		//TODO (for the miro devs) show notification
		console.error('Invalid Credentials for this address!', props.error);
	}

	return (
		<div className="container">
			<Header centered={true}>
				CodeBeamer / Miro Integration
				<br />
				<small>
					<span className="icon icon-plug pos-adjusted-down"></span>
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
					enableReinitialize={true}
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
						dispatch(
							setCredentials({
								username: values.cbUsername,
								password: values.cbPassword,
							})
						);
						dispatch(setCbAddress(values.cbAddress));
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
									data-test="cbAddress"
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
									data-test="cbUsername"
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
									data-test="cbPassword"
								/>
								{errors.cbPassword && touched.cbPassword && (
									<div className="status-text">
										{errors.cbPassword}
									</div>
								)}
							</div>

							<div className="flex-centered mt-3">
								<button
									type="submit"
									disabled={isSubmitting || props.loading}
									className={`button button-primary ${
										isSubmitting || props.loading
											? 'button-loading'
											: ''
									}`}
									data-test="submit"
								>
									{/*//TODO icon*/}
									Connect
								</button>
							</div>
						</form>
					)}
				</Formik>
			</div>
		</div>
	);
}
