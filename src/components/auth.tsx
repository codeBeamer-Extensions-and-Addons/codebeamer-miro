import { Formik } from 'formik';
import * as React from 'react';
import './auth.css';

export default function AuthForm() {
	return (
		<>
			<h1>
				CodeBeamer / Miro Integration
				<br />
				<small>Connect to your CodeBeamer Instance</small>
			</h1>
			<div>
				<Formik
					initialValues={{
						cbAddress: '',
						projectId: '',
						cbUsername: '',
						cbPassword: '',
					}}
					onSubmit={(values, { setSubmitting }) => {
						//TODO attempt auth
						setTimeout(() => {
							console.log(
								`Authenticated as ${values.cbUsername}`
							);
							setSubmitting(false);
						}, 400);
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
							<div>
								<label>CodeBeamer Address</label>
								<input
									type="text"
									name="cbAddress"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.cbAddress}
								></input>
							</div>
							<div>
								<label>Project ID</label>
								<input
									type="text"
									name="projectId"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.projectId}
								></input>
							</div>
							<div>
								<label>CB Username</label>
								<input
									type="text"
									name="cbUsername"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.cbUsername}
								></input>
							</div>
							<div>
								<label>CB Password</label>
								<input
									type="password"
									name="cbPassword"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.cbPassword}
								></input>
							</div>
						</form>
					)}
				</Formik>
			</div>
		</>
	);
}
