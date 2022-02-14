import { ImportConfiguration, BoardSetting, LocalSetting, SessionSetting, SettingKey, UserMapping } from "../entities";

export default class Store {
	private static _instance: Store;

	private _appId: string = (100000 + (Math.random()*999999)).toString();

  public get appId(): string {
		return this._appId;
	}
  
	private _boardId: string = (100000 + (Math.random()*999999)).toString();

	public get boardId(): string {
		return this._boardId;
	}

	private constructor(clientId, boardId: string) {
    this._appId = clientId;
		this._boardId = boardId;
	}

	public static create(clientId: string, boardId: string): Store {
    this._instance = new Store(clientId, boardId);
		return this._instance;
	}

	public static getInstance() {
		if (!this._instance) {
			// ? Could potentially cause faulty behaviour in production, but the Store usually gets initialized
			// ? on miro.onReady, which should always trigger instantly on the modals.
			// * So this provides a standardized Store for e2e tests, since Store.create() done there doesn't
			// * appear to allow for getting it in the plugin's context (contrary to cypress claims...).
			console.warn("Store not initialized. Initializing a test-store with test-ids.");
			const fakeClientId = "e2e-test";
			const fakeBoardId = "e2e-test";
			return Store.create(fakeClientId, fakeBoardId);
		}
		return this._instance;
	}

	/**
	 * Gets the value of given property of the board settings. Opens the settings modal in case it can't find no boardsettings.
	 * @param setting Property of the settings to read
	 * @returns Value of the {setting} property of the board settings
	 */
	public getBoardSetting(setting: BoardSetting) {
		let data = JSON.parse(
			localStorage.getItem(this.getBoardSettingsLocalStorageKey()) || "{}"
		);
		if (!data) {
			throw new Error(
				`Coudnn't load board settings. Please verify their integrity in the plugin settings.`
			);
		}
		return data[setting];
	}

	/**
	 * @returns Localstorage key for the "local" data.
	 */
	private getLocalSettingsLocalStorageKey() {
		return SettingKey.LS_KEY + "-" + this.boardId;
	}

	/**
	 * @returns Sessionstorage key for the "session" data.
	 */
	private getSessionStorageKey() {
		return SettingKey.SS_KEY + "-" + this.boardId;
	}

	/**
	 * @returns Localstorage key for the "boardSettings" data.
	 */
	private getBoardSettingsLocalStorageKey() {
		return SettingKey.LS_BS_KEY + "-" + this.boardId;
	}

	/**
	 * Saves the given settings object as boardSettings in the local storage.
	 * @param settings Settings object to save
	 */
	public async saveBoardSettings(settings) {
		const currentSettings = localStorage.getItem(
			this.getBoardSettingsLocalStorageKey()
		);
		let data = currentSettings === null ? {} : JSON.parse(currentSettings);
		Object.assign(data, settings);
		localStorage.setItem(
			this.getBoardSettingsLocalStorageKey(),
			JSON.stringify(data)
		);
	}

	/**
	 * Saves given settings in the localStorage.
	 * @param settings Settings object to save.
	 */
	public saveLocalSettings(settings: { [key: string]: string | boolean }) {
		const currentSettings = localStorage.getItem(
			this.getLocalSettingsLocalStorageKey()
		);
		let data = currentSettings === null ? {} : JSON.parse(currentSettings);
		Object.assign(data, settings);
		localStorage.setItem(
			this.getLocalSettingsLocalStorageKey(),
			JSON.stringify(data)
		);
	}

	/**
	 * Saves given settings in the sessionStorage.
	 * @param settings Settings object to save.
	 */
	public saveSessionSettings(settings: { [key: string]: string | boolean }) {
		const currentSettings = sessionStorage.getItem(
			this.getSessionStorageKey()
		);
		let data = currentSettings === null ? {} : JSON.parse(currentSettings);
		Object.assign(data, settings);
		sessionStorage.setItem(
			this.getSessionStorageKey(),
			JSON.stringify(data)
		);
	}

	/**
	 * Gets the value of given property of the local settings. Opens the settings modal in case it can't find none.
	 * @param setting Property of the settings to read
	 * @returns Value of the {setting} property of the local settings
	 */
	public getLocalSetting(setting: LocalSetting) {
		let data = JSON.parse(
			localStorage.getItem(this.getLocalSettingsLocalStorageKey()) || "{}"
		);
		if (!data) {
			miro.showNotification(
				`Couldn't load local settings. Please re-enter them and then retry.`
			);
			miro.board.ui.openModal("settings.html");
			throw new Error(
				`Coudnn't load local settings. Please verify their integrity in the plugin settings.`
			);
		}
		return data[setting];
	}

	/**
	 * Gets the value of given property of the session settings. Opens the settings modal in case it can't find none.
	 * @param setting Property of the settings to read
	 * @returns Value of the {setting} property of the session settings
	 */
	public getSessionSetting(setting: SessionSetting) {
		let data = JSON.parse(
			sessionStorage.getItem(this.getSessionStorageKey()) || "{}"
		);
		if (!data) {
			miro.showNotification(
				`Couldn't load local settings. Please re-enter them and then retry.`
			);
			miro.board.ui.openModal("settings.html");
			throw new Error(
				`Coudnn't load session settings. Please verify their integrity in the plugin settings.`
			);
		}
		return data[setting];
	}

	public async storeUserMapping(mapping: UserMapping) {
		let storedMappings: UserMapping[];
		try {
			storedMappings = this.getBoardSetting(BoardSetting.USER_MAPPING) as UserMapping[];
		} catch (error) {
			storedMappings = [];
		}

		// remove all mappings for both, the cbUser and the miroUser
		storedMappings = storedMappings.filter(
			(m) =>
				m.cbUserId != mapping.cbUserId &&
				m.miroUserId != mapping.miroUserId
		);
		storedMappings.push(mapping);
		await this.saveBoardSettings({
			[BoardSetting.USER_MAPPING]: storedMappings,
		});
	}

	public getUserMapping(userDetails: Partial<UserMapping>) {
		let storedMappings: UserMapping[];
		try {
			storedMappings = this.getBoardSetting(BoardSetting.USER_MAPPING) as UserMapping[];
		} catch (error) {
			return null;
		}
		return storedMappings.find(
			(m) =>
				(!userDetails.cbUserId || m.cbUserId == userDetails.cbUserId) &&
				(!userDetails.miroUserId ||
					m.miroUserId == userDetails.miroUserId)
		);
	}
}
