import App from './app';

export async function getWidgetDetail(widget) {
  return (await miro.board.widgets.get(widget))[0]
}

export async function findWidgetByTypeAndMetadataId(widgetData) {
  return (
    (await miro.board.widgets.get({
      type: widgetData.type,
    })))
    .filter(widget => !!widget.metadata[App.id])
    .find(widget => widget.metadata[App.id].id === widgetData.metadata[App.id].id)
}

export async function findLinesByFromCard(fromCardId) {
  return (
      await miro.board.widgets.get<SDK.ILineWidget>({
        type: 'LINE',
      })
    )
      .filter(line => line.metadata[App.id] && line.startWidgetId === fromCardId)
}

export async function createOrUpdateWidget(widgetData) {
  const existingWidget = await findWidgetByTypeAndMetadataId(widgetData);
  if (existingWidget) {
    widgetData.id = existingWidget.id
    return await updateWidget(widgetData)
  } else {
    return await createWidget(widgetData)
  }
}

async function createWidget(widgetData) {
  // if x and y are not set, set them to middle of current screen
  if (widgetData.type === 'CARD' && (!widgetData.x || !widgetData.y)) {
    const viewport = await miro.board.viewport.get();
    widgetData.x = (viewport.x + (viewport.width / 2))
    widgetData.y = (viewport.y + (viewport.height / 2))
  }
  let widget = (await miro.board.widgets.create(widgetData))[0]
  let itemId = widget.metadata[App.id].id
  console.log(`${widget.type} widget ${widget.id} has been created to match item ${itemId ? itemId : '<the settings>'}`)
  return widget
}

async function updateWidget(widgetData) {
  let widget = (await miro.board.widgets.update(widgetData))[0]
  let itemId = widget.metadata[App.id].id
  console.log(`${widget.type} widget ${widget.id} has been updated to match item ${itemId ? itemId : '<the settings>'}`)
  return widget
}

export async function deleteWidget(widgetData) {
  return await miro.board.widgets.deleteById(widgetData)
}