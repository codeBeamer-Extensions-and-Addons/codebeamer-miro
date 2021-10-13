import { createOrUpdateWidget, recreateWidget } from '../components/miro';
import { CardData } from "../types/CardData"
import { BoardSetting, Constants, LocalSetting, PLUGIN_WIDGET_DESCRIPTION, PLUGIN_WIDGET_TITLE, SessionSetting } from './constants';
import App from "./app"
import { UserMapping } from '../types/UserMapping';
import { CODEBEAMER_ICON } from '../init';

interface getUserMappingParam {
  cbUserId?: string,
  miroUserId?: string,
}

class Store {
  private static instance: Store

  public state: any = {
    onReadyCalled: false,
    onReadyFuncs: []
  }
  public configWidget: SDK.ICardWidget

  private static configInitCalled: boolean = false

  private constructor() { }

  public static getInstance() {
    if (!Store.instance) Store.instance = new Store();
    return Store.instance;
  }

  public onPluginReady(func: { (): Promise<void> }) {
    if (this.state.onReadyCalled) {
      func()
    } else {
      this.state.onReadyFuncs.push(func)
    }
  }

  public static runOnPluginReadyFuncs() {
    Store.getInstance().state.onReadyCalled = true
    while (Store.getInstance().state.onReadyFuncs.length) { Store.getInstance().state.onReadyFuncs.shift().call() }
  }

  /**
   * Gets the value of given property of the board settings. Opens the settings modal in case it can't find no boardsettings.
   * @param setting Property of the settings to read
   * @returns Value of the {setting} property of the board settings
   */
  public getBoardSetting(setting: BoardSetting) {
    //console.log("Getting Board settings from ConfigWidget: " + JSON.stringify(this.configWidget))
    //return this.configWidget.metadata[App.appId].settings[setting];

    let data = JSON.parse(localStorage.getItem(this.getBoardSettingsLocalStorageKey()) || '{}');
    if(!data) {
      miro.showNotification(`Couldn't load board settings. Please re-enter them and then retry.`)
      miro.board.ui.openModal('settings.html');
      throw new Error(`Coudnn't load board settings. Please verify their integrity in the plugin settings.`)
    }
    return data[setting];
  }

  /**
   * @returns Localstorage key for the "local" data.
   */
  private getLocalSettingsLocalStorageKey() { return Constants.LS_KEY + "-" + App.boardId }

  /**
   * @returns Sessionstorage key for the "session" data.
   */
  private getSessionStorageKey() { return Constants.SS_KEY + "-" + App.boardId };

  /**
   * @returns Localstorage key for the "boardSettings" data.
   */
  private getBoardSettingsLocalStorageKey() { return Constants.LS_BS_KEY + "-" + App.boardId }

  /**
   * Saves the given settings object as boardSettings in the local storage.
   * @param settings Settings object to save
   */
   public async saveBoardSettings(settings) {
    const currentSettings = localStorage.getItem(this.getBoardSettingsLocalStorageKey());
    let data = currentSettings === null ? {} : JSON.parse(currentSettings);
    Object.assign(data, settings);
    localStorage.setItem(this.getBoardSettingsLocalStorageKey(), JSON.stringify(data))

    // Object.assign(this.configWidget.metadata[App.appId].settings, settings)
    // this.configWidget = await recreateWidget(this.configWidget) as SDK.ICardWidget
  }

  /**
   * Saves given settings in the localStorage.
   * @param settings Settings object to save.
   */
  public saveLocalSettings(settings: { [key: string]: string | boolean }) {
    const currentSettings = localStorage.getItem(this.getLocalSettingsLocalStorageKey());
    let data = currentSettings === null ? {} : JSON.parse(currentSettings);
    Object.assign(data, settings)
    localStorage.setItem(this.getLocalSettingsLocalStorageKey(), JSON.stringify(data))
  }

  /**
   * Saves given settings in the sessionStorage. 
   * @param settings Settings object to save.
   */
  public saveSessionSettings(settings: { [key:string]: string | boolean }) {
    const currentSettings = sessionStorage.getItem(this.getSessionStorageKey());
    let data = currentSettings === null ? {} : JSON.parse(currentSettings);
    Object.assign(data, settings)
    sessionStorage.setItem(this.getSessionStorageKey(), JSON.stringify(data))
  }

  /**
   * Gets the value of given property of the local settings. Opens the settings modal in case it can't find none.
   * @param setting Property of the settings to read
   * @returns Value of the {setting} property of the local settings
   */
  public getLocalSetting(setting: LocalSetting) {
    let data = JSON.parse(localStorage.getItem(this.getLocalSettingsLocalStorageKey()) || '{}')
    if(!data) {
      miro.showNotification(`Couldn't load local settings. Please re-enter them and then retry.`)
      miro.board.ui.openModal('settings.html');
      throw new Error(`Coudnn't load local settings. Please verify their integrity in the plugin settings.`)
    }
    return data[setting]
  }

  /**
   * Gets the value of given property of the session settings. Opens the settings modal in case it can't find none.
   * @param setting Property of the settings to read
   * @returns Value of the {setting} property of the session settings
   */
  public getSessionSetting(setting: SessionSetting) {
    let data = JSON.parse(sessionStorage.getItem(this.getSessionStorageKey()) || '{}');
    if(!data) {
      miro.showNotification(`Couldn't load local settings. Please re-enter them and then retry.`)
      miro.board.ui.openModal('settings.html');
      throw new Error(`Coudnn't load session settings. Please verify their integrity in the plugin settings.`)
    }
    return data[setting]
  }

  public async storeUserMapping(mapping: UserMapping) {
    let storedMappings = this.getBoardSetting(BoardSetting.USER_MAPPING) as UserMapping[]
    if (!storedMappings) storedMappings = []

    // remove all mappings for both, the cbUser and the miroUser
    storedMappings = storedMappings.filter(m => m.cbUserId != mapping.cbUserId && m.miroUserId != mapping.miroUserId)
    storedMappings.push(mapping)
    await this.saveBoardSettings({ [BoardSetting.USER_MAPPING]: storedMappings })
  }

  public getUserMapping(userDetails: getUserMappingParam) {
    let storedMappings = this.getBoardSetting(BoardSetting.USER_MAPPING) as UserMapping[]
    return storedMappings.find(m => (!userDetails.cbUserId || m.cbUserId == userDetails.cbUserId) && (!userDetails.miroUserId || m.miroUserId == userDetails.miroUserId))
  }

  /**
   * Initializes (creates and/or saves reference to) the plugin's config widget, which serves 
   * to access (and formerly store in it's metadata) plugin-settings.
   */
  public static async initConfigCard() {
    // do nothing if already initialized
    if (Store.configInitCalled) return
    Store.configInitCalled = true

    // try to find the widget
    let settingsWidget = (await miro.board.widgets.get({ type: 'CARD', }))
      .filter(widget => !!widget.metadata[App.appId])
      .find(widget => !!widget.metadata[App.appId].settings) as SDK.ICardWidget

    // create if not exists
    if (!settingsWidget) {
      let cardData: CardData = {
        type: 'CARD',
        title: PLUGIN_WIDGET_TITLE,
        description: PLUGIN_WIDGET_DESCRIPTION,
        capabilities: { editable: false },
        metadata: {
          [App.appId]: {
            settings: {},
          },
        },
        card: { 
          logo: { iconUrl: `${window.location.href}img/codeBeamer-Logo.png` } },
        style: { backgroundColor: '#00A85D' }
      }
      settingsWidget = await createOrUpdateWidget(cardData) as SDK.ICardWidget
    }

    Store.getInstance().configWidget = settingsWidget
  }
}

async function onAllWidgetsLoaded(callback) {
  const areAllWidgetsLoaded = await miro.board.widgets.areAllWidgetsLoaded()
  if (areAllWidgetsLoaded) {
    callback()
  } else {
    miro.addListener('ALL_WIDGETS_LOADED', callback)
  }
}

miro.onReady(async () => {
  await App.getAndSetIds()

  onAllWidgetsLoaded(async () => {
    await Store.initConfigCard()
    Store.runOnPluginReadyFuncs()
  })
})

export default Store;