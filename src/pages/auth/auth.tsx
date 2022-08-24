import { Field, Formik } from 'formik';
import * as React from 'react';
import Header from '../../components/header/Header';
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

/**
 * The authentication form lets a user define the codeBeamer instance they want to connect to
 * and provide their credentials. This only directly modifies the values kept in the store,
 * while actual connection attempts are made in the Content component.
 * @param props Loading defines whether or not to show a loading spinner on the button, errors show in notifications.
 */
export default function AuthForm(props: {
	loading?: boolean;
	error?: any;
	headerLess?: boolean;
}) {
	const dispatch = useDispatch();

	const { cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.userSettings
	);
	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	if (props.error) {
		//TODO miro.showErrorNotif
		console.error('Invalid Credentials and/or address!', props.error);
	}

	return (
		<div data-test="auth" className="container">
			{!props.headerLess && (
				<Header centered={true} margin={true}>
					CodeBeamer / Miro Integration
					<br />
					<small>
						<span className="icon icon-plug pos-adjusted-down"></span>
						Connect to your CodeBeamer Instance
					</small>
				</Header>
			)}
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
									<div
										className="status-text"
										data-test="cbAddressErrors"
									>
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

							<div className="flex-centered mt-4">
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
