import { createOrUpdateWidget, recreateWidget } from '../components/miro';
import { CardData } from "../types/CardData"
import { BoardSetting, Constants, LocalSetting } from './constants';
import App from "./app"
import { UserMapping } from '../types/UserMapping';

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

  public getBoardSetting(setting: BoardSetting) {
    console.log("Getting Board settings from ConfigWidget: " + JSON.stringify(this.configWidget))
    return this.configWidget.metadata[App.appId].settings[setting];
  }

  public async saveBoardSettings(settings) {
    Object.assign(this.configWidget.metadata[App.appId].settings, settings)
    this.configWidget = await recreateWidget(this.configWidget) as SDK.ICardWidget
  }

  private getLocalStoreLocation() { return Constants.LS_KEY + "-" + App.boardId }

  public saveLocalSettings(settings: { [key: string]: string | boolean }) {
    const currentSettings = localStorage.getItem(this.getLocalStoreLocation());
    let data = currentSettings === null ? {} : JSON.parse(currentSettings);
    Object.assign(data, settings)
    localStorage.setItem(this.getLocalStoreLocation(), JSON.stringify(data))
  }

  public getLocalSetting(setting: LocalSetting) {
    let data = JSON.parse(localStorage.getItem(this.getLocalStoreLocation()) || '{}')
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
        title: 'CodeBeamer-Miro Settings. Click on the context button to make changes!',
        capabilities: { editable: false },
        metadata: {
          [App.appId]: {
            settings: {},
          },
        },
        card: { logo: { iconUrl: `${window.location.href}img/codeBeamer-Logo.png` } },
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