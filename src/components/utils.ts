import Store from './store';
import { createOrUpdateWidget } from './miro';

const store = Store.getInstance();

// call in on All widgets Loaded
export async function createOrHideSettingsWidget() {
  let settingsWidget = await findSettingsWidget()
  if (settingsWidget) {
    // hide settings
    settingsWidget.clientVisible = false
    await createOrUpdateWidget(settingsWidget)
  } else {
    settingsWidget = await createOrUpdateWidget({
      type: 'SHAPE',
      text: 'codeBeamer-miro Settings. You should not be able to see this!',
      clientVisible: false,
      metadata: {
        [store.state.appId]: {
          settings: {},
        },
      },
    })
  }
  return settingsWidget
}

function isWidgetConvertable(widget) {
  let supportedWidgetTypes = ['STICKER', 'CARD', 'TEXT', 'SHAPE']
  return (!widget.metadata || !widget.metadata[store.state.appId]) // only allow items NOT created by this plugin
    && supportedWidgetTypes.includes(widget.type) // only allow supported types
}

export function isSelectionConvertable(selectedWidgets) {
  // only single selection supported
  return selectedWidgets.length === 1 && (isWidgetConvertable(selectedWidgets[0]))
}

export async function findSettingsWidget() {
  return (
    await miro.board.widgets.get({
      type: 'SHAPE',
    })
  )
    .filter(widget => !!widget.metadata[store.state.appId])
    .find(widget => !!widget.metadata[store.state.appId].settings)
}

export async function getBoardSetting(setting) {
  const settingsWidget = await findSettingsWidget();
  if(settingsWidget) return settingsWidget.metadata[store.state.appId].settings[setting];
}

export async function saveBoardSettings(settings) {
  const settingsWidget = await findSettingsWidget()
  if(settingsWidget) Object.assign(settingsWidget.metadata[store.state.appId].settings, settings)
  return await createOrUpdateWidget(settingsWidget)
}

export async function getPrivateSetting(setting: string) {
  let data = JSON.parse(localStorage.getItem(store.state.LS_KEY) || '') || {}
  return data[setting]
}

export async function savePrivateSettings(settings: { [key: string] : string }) {
  const currentSettings = localStorage.getItem(store.state.LS_KEY);
  let data = currentSettings === null ? {} : JSON.parse(currentSettings);
  Object.assign(data, settings)
  localStorage.setItem(store.state.LS_KEY, JSON.stringify(data))
}