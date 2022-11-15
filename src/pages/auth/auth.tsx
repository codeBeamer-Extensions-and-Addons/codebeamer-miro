import { Field, Formik } from 'formik';
import * as React from 'react';
import './auth.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
	setCredentials,
	setTrackerId,
} from '../../store/slices/userSettingsSlice';
import {
	setCbAddress,
	setProjectId,
} from '../../store/slices/boardSettingsSlice';
import { useState } from 'react';
import { displayAppMessage } from '../../store/slices/appMessagesSlice';

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
	successAnimation?: boolean;
}) {
	const dispatch = useDispatch();

	const [animateSuccess, setAnimateSuccess] = useState(false);
	const [showRCNHint, setShowRCNHint] = useState(false);

	const { cbUsername, cbPassword } = useSelector(
		(state: RootState) => state.userSettings
	);
	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);

	// if (props.error) {
	// 	dispatch(
	// 		displayAppMessage({
	// 			header: 'Invalid Credentials and/or address',
	// 			bg: 'danger',
	// 			delay: 2500,
	// 		})
	// 	);
	// 	console.error('Invalid Credentials and/or address!', props.error);
	// }

	/**
	 * Toggles the {@link showRCNHint} variable, which triggers the respective hint to show or not.
	 */
	const toggleRCNHint = (e: React.ChangeEvent<any>) => {
		if (e.target.value.includes('retina')) {
			setShowRCNHint(true);
		} else {
			setShowRCNHint(false);
		}
	};

	const showSuccessAnimation = () => {
		setAnimateSuccess(true);
		setTimeout(() => {
			setAnimateSuccess(false);
		}, 2000);
	};

	return (
		<div data-test="auth" className="container">
			{!props.headerLess && (
				<header className="text-center mb-5">
					<h2>codebeamer cards</h2>
					<p>
						<span className="icon icon-plug pos-adjusted-down"></span>
						<span className="ml-small">
							Connect to your codebeamer Instance
						</span>
					</p>
				</header>
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
						dispatch(setCbAddress(values.cbAddress));
						dispatch(
							setCredentials({
								username: values.cbUsername,
								password: values.cbPassword,
							})
						);
						if (values.cbAddress != cbAddress) {
							dispatch(setProjectId(''));
							dispatch(setTrackerId(''));
						}

						if (props.successAnimation) showSuccessAnimation();
					}}
				>
					{({
						values,
						errors,
						touched,
						handleChange,
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
									onChange={(e: React.ChangeEvent<any>) => {
										handleChange(e);
										toggleRCNHint(e);
									}}
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
								{showRCNHint && (
									<div
										className="status-text muted"
										data-test="rcnHint"
									>
										RCN connection required
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
								{!animateSuccess && (
									<button
										type="submit"
										disabled={isSubmitting || props.loading}
										className={`fade-in button button-primary ${
											isSubmitting || props.loading
												? 'button-loading'
												: ''
										}`}
										data-test="submit"
									>
										Connect
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
						</form>
					)}
				</Formik>
			</div>
		</div>
	);
}
