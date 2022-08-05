/**
 * CodeBeamer API interface
 */
export default class CodeBeamerService {
	private static instance: CodeBeamerService;

	private constructor() {}

	/**
	 * @returns Reference to the CodeBeamerService instance
	 */
	public static getInstance(): CodeBeamerService {
		if (!this.instance) {
			this.instance = new CodeBeamerService();
		}
		return this.instance;
	}

	/**
	 * Creates the standard headers required for a request to the codeBeamer API, consisting of content-type and authorization specifications.
	 * @returns HTTP Request Headers for making a codeBeamer API request.
	 */
	private getCbHeaders(username: string, password: string): Headers {
		let headers = new Headers({
			'Content-Type': 'application/json',
		});

		// let username = this.store.getLocalSetting(LocalSetting.CB_USERNAME);
		// let password = this.store.getSessionSetting(SessionSetting.CB_PASSWORD);

		headers.append(
			'Authorization',
			'Basic ' + btoa(username + ':' + password)
		);

		return headers;
	}

	/**
	 * Fetches a user's data from the cb API. Usually just used to check that connection to the API is established and authorized.
	 * @param username CodeBeamer username of the user in question
	 * @returns The user's codeBeamer account data
	 */
	public async getCodeBeamerUser(
		cbAddress: string,
		username: string,
		password: string
	): Promise<any> {
		const requestUrl = `${cbAddress}/api/v3/users/findByName?name=${username}`;

		try {
			const response = await fetch(requestUrl, {
				method: 'GET',
				headers: this.getCbHeaders(username, password),
			});
			if (!response.ok) {
				throw new Error(response.status.toString());
			}
			return await response.json();
		} catch (err) {
			throw new Error(`Failed getting data for user ${username}: ${err}`);
		}
	}
}
