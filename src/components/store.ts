import { createOrUpdateWidget } from '../components/miro';
import { CardData } from "../types/CardData"
import { BoardSetting } from './constants';
import App from "./app"

class Store {
  private static instance: Store

  public state: any = {
    onReadyCalled: false,
    onReadyFuncs: []
  }
  public configWidget: SDK.ICardWidget

  private static configInitCalled: boolean = false

  private constructor() {}

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

  public getBoardSetting(setting : BoardSetting) {
    return this.configWidget.metadata[App.id].settings[setting];
  }

  public async saveBoardSettings(settings) {
    Object.assign(this.configWidget.metadata[App.id].settings, settings)
    this.configWidget = await createOrUpdateWidget(this.configWidget) as SDK.ICardWidget
  }

  public static async initConfigCard() {
    // do nothing if already initialized
    if (Store.configInitCalled) return
    Store.configInitCalled = true

    // try to find the widget
    let settingsWidget = (await miro.board.widgets.get({ type: 'CARD', }))
      .filter(widget => !!widget.metadata[App.id])
      .find(widget => !!widget.metadata[App.id].settings) as SDK.ICardWidget

    // create if not exists
    if (!settingsWidget) {
      let cardData: CardData = {
        type: 'CARD',
        title: 'CodeBeamer-Miro Settings. Click on the context button to make changes!',
        capabilities: { editable: false },
        metadata: {
          [App.id]: {
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

miro.onReady(() => {
  App.getAndSetId()

  onAllWidgetsLoaded(async () => {
    await Store.initConfigCard()
    Store.runOnPluginReadyFuncs()
  })
})

export default Store;