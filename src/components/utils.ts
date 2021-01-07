import App from './app';
import { Constants } from './constants';

// call in on All widgets Loaded
//////////////////////////////////////

function isWidgetConvertable(widget: SDK.IWidget) {
  let supportedWidgetTypes = ['STICKER', 'CARD', 'TEXT', 'SHAPE']
  return (!widget.metadata || !widget.metadata[App.id]) // only allow items NOT created by this plugin
    && supportedWidgetTypes.includes(widget.type) // only allow supported types
}

export function isSelectionConvertable(selectedWidgets: SDK.IWidget[]) {
  // only single selection supported
  return selectedWidgets.length === 1 && (isWidgetConvertable(selectedWidgets[0]))
}

function isSettingsWidget(widget: SDK.IWidget) {
  return widget.metadata && widget.metadata[App.id] && widget.metadata[App.id].settings
}

export function isSettingsWidgetSelected(selectedWidgets: SDK.IWidget[]) {
  return selectedWidgets.length === 1 && (isSettingsWidget(selectedWidgets[0]))
}

export async function savePrivateSettings(settings: { [key: string]: string }) {
  const currentSettings = localStorage.getItem(Constants.LS_KEY);
  let data = currentSettings === null ? {} : JSON.parse(currentSettings);
  Object.assign(data, settings)
  localStorage.setItem(Constants.LS_KEY, JSON.stringify(data))
}

export async function getPrivateSetting(setting: string) {
  let data = JSON.parse(localStorage.getItem(Constants.LS_KEY) || '{}')
  return data[setting]
}
