import App from './app';

export async function getAllSynchedCodeBeamerCardItemIds() {
  return (
    (await miro.board.widgets.get({
      type: 'CARD',
    })))
    .filter(widget => widget.metadata[App.appId] && widget.metadata[App.appId].id)
    .map(widget => widget.metadata[App.appId].id as string)
}

export async function getWidgetDetail(widget) {
  return (await miro.board.widgets.get(widget))[0]
}

export async function findWidgetByTypeAndMetadataId(widgetData): Promise<SDK.IWidget | undefined> {
  return miro.board.widgets.get({
    type: widgetData.type,
  }).then(widgets =>
    widgets
      .filter(widget => !!widget.metadata[App.appId])
      .find(widget => widget.metadata[App.appId].id === widgetData.metadata[App.appId].id)
  )
}

export async function findLinesByFromCard(fromCardId) {
  return (
    await miro.board.widgets.get<SDK.ILineWidget>({
      type: 'LINE',
    })
  )
    .filter(line => line.metadata[App.appId] && line.startWidgetId === fromCardId)
}

export async function createOrUpdateWidget(widgetData) {
  const existingWidget = await findWidgetByTypeAndMetadataId(widgetData);
  if (existingWidget) {
    widgetData.id = existingWidget.id
    return updateWidget(widgetData)
  } else {
    return createWidget(widgetData)
  }
}

async function createWidget(widgetData) {
  // if x and y are not set, set them to middle of current screen
  if (widgetData.type === 'CARD' && (!widgetData.x || !widgetData.y)) {
    const viewport = await miro.board.viewport.get();
    let randomXOffset = Math.random()*viewport.width / 4;
    let randomYOffset = Math.random()*viewport.height / 4;
    widgetData.x = (viewport.x + (viewport.width / 2) + randomXOffset)
    widgetData.y = (viewport.y + (viewport.height / 2) + randomYOffset)
  }
  let widget = (await miro.board.widgets.create(widgetData))[0]
  let itemId = widget.metadata[App.appId].id
  console.log(`[codeBeamer-sync] ${widget.type} widget ${widget.id} has been created to match item ${itemId ? itemId : '<the settings>'}`)
  return widget
}

async function updateWidget(widgetData) {
  let widget = (await miro.board.widgets.update(widgetData))[0]
  let itemId = widget.metadata[App.appId].id
  console.log(`[codeBeamer-sync] ${widget.type} widget ${widget.id} has been updated to match item ${itemId ? itemId : '<the settings>'}`)
  return widget
}

// temporary function to recreate the settings widget as metadata are currently only persisted when set on creation
// https://community.miro.com/developer-platform-and-apis-57/metadata-updated-are-not-persistent-4761
export async function recreateWidget(widgetData) {
  await deleteWidget(widgetData.id)
  widgetData.id = undefined
  return createWidget(widgetData)
}

export async function deleteWidget(widgetData) {
  return miro.board.widgets.deleteById(widgetData)
}

// maybe needed in the future - CARE this was changed on the API - cant use getToken anymore
async function getToken() {
  if (await miro.isAuthorized()) {
    return miro.getToken()
  } else {
    return miro.authorize({ response_type: 'token' })
  }
}

export function getCurrentUserId() {
  return miro.currentUser.getId()
}