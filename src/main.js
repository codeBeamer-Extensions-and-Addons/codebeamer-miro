const NEWPOS = "NEWPOS"

async function onAllWidgetsLoaded(callback) {
  const areAllWidgetsLoaded = await miro.board.widgets.areAllWidgetsLoaded()
  if (areAllWidgetsLoaded) {
    callback()
  } else {
    miro.addListener('ALL_WIDGETS_LOADED', callback)
  }
}

function isSelectionConvertable(selectedWidgets) {
  // only single selection supported
  return selectedWidgets.length === 1 && (isWidgetConvertable(selectedWidgets[0]))
}

function isWidgetConvertable(widget) {
  let supportedWidgetTypes = ['STICKER', 'CARD', 'TEXT', 'SHAPE']
  return (!widget.metadata || !widget.metadata[miro.getClientId()]) // only allow items NOT created by this plugin
    && supportedWidgetTypes.includes(widget.type) // only allow supported types
}

function isSelectionOpenable(selectedWidgets) {
  // only single selection supported
  return !selectedWidgets.some(widget => !isWidgetRepresentingCodeBeamerItem(widget))
}

function isWidgetRepresentingCodeBeamerItem(widget) {
  let appId = miro.getClientId()
  return widget.metadata && widget.metadata[appId] && widget.metadata[appId].id
}


async function openInCodeBeamer(selectedWidgets) {
  await Promise.all(
    selectedWidgets.map(async widget => {
      await window.open(await getCodeBeamerItemURL(widget.metadata[miro.getClientId()].id), '_blank')
    })
  )
}

async function syncWithCodeBeamer() {
  await getCodeBeamerItems()
    .then(async cbItems => {
      await Promise.all(cbItems.map(cbItem => createOrUpdateCbItem(cbItem)))
      await Promise.all(cbItems.map(cbItem => createUpdateOrDeleteAssociationLines(cbItem)))
    })
  miro.showNotification('Sync with codeBeamer finished!')
}

async function enrichBaseCbItemWithDetails(cbItem) {
  cbItem.tracker = await getCodeBeamerTrackerDetails(cbItem.tracker)
  cbItem.renderedDescription = cbItem.descriptionFormat === 'Wiki'
    ? await getCodeBeamerWiki2Html(cbItem.description, cbItem)
    : cbItem.description
  return cbItem
}

async function createOrUpdateCbItem(cbItem) {
  await enrichBaseCbItemWithDetails(cbItem)
  let cardData = await convert2Card(cbItem)
  cbItem.card = await createOrUpdateWidget(cardData)
  return cbItem
}

async function createUpdateOrDeleteAssociationLines(cbItem) {
  let associations = await getCodeBeamerOutgoingAssociations(cbItem)
  const existingLines = await findLinesByFromCard(cbItem.card.id)

  // delete lines which are no longer present that originate on any of the items synched above
  let deletionTask = Promise.all(
    existingLines.map(
      async line => {
        let appId = miro.getClientId()
        if (!associations.find(association => line.metadata[appId].id === association.id)) {
          console.log(`deleting line ${line.id} because the association ${line.metadata[appId].id} does not exist anymore`)
          await deleteWidget(line)
        }
      }
    )
  )

  // add or update lines
  let additionTask = Promise.all(
    associations.map(
      async association => {
        const toCard = await findWidgetByTypeAndMetadataId({ type: 'CARD', metadata: { [miro.getClientId()]: { id: association.itemRevision.id } } });
        console.log(`Association ${association.id}: card for codeBeamer ID ${association.itemRevision.id} is: ${toCard ? toCard.id : 'NOT FOUND (item not synced)'}`)
        if (toCard) {
          let associationDetails = await getCodeBeamerAccociationDetails(association)
          await createOrUpdateWidget(convert2Line(associationDetails, cbItem.card.id, toCard.id))
        }
      }
    )
  )

  await Promise.all([deletionTask, additionTask])
}

async function submitNewCodeBeamerItem(widget) {
  // get widget with all meta data (the selected one only has the general widget properties, but is lacking the type specifcs)
  widget = await getWidgetDetail({ id: widget.id })
  // generate submission object and submit
  let submissionItem = convert2CbItem(widget)
  let cbItem = await addNewCbItem(submissionItem)
  // create new item in same position as old one
  cbItem[NEWPOS] = { x: widget.x, y: widget.y }
  deleteWidget(widget) // dont wait
  await createOrUpdateCbItem(cbItem)
  miro.board.selection.selectWidgets({ id: cbItem.card.id })
  // delete old widget

  // no need to sync associations as the item was just created. Need to change if we add ability to link from miro
}


// ------------------------ Settings ------------------------------

// call in on All widgets Loaded
async function CreateOrHideSettingsWidget() {
  let settingsWidget = await findSettingsWidget()
  if (settingsWidget) {
    // hide settings
    settingsWidget.clientVisible = false
    await updateWidget(settingsWidget)
  } else {
    settingsWidget = await createWidget({
      type: 'SHAPE',
      text: 'codeBeamer-miro Settings. You should not be able to see this!',
      clientVisible: false,
      metadata: {
        [miro.getClientId()]: {
          settings: {},
        },
      },
    })
  }
  return settingsWidget
}


async function getBoardSetting(setting) {
  return (await findSettingsWidget()).metadata[miro.getClientId()].settings[setting]
}

async function saveBoardSettings(settings) {
  let settingsWidget = await findSettingsWidget()
  Object.assign(settingsWidget.metadata[miro.getClientId()].settings, settings)
  return await updateWidget(settingsWidget)
}

const LS_KEY = `codebeamer-miro-plugin-widget-private-settings`

async function getPrivateSetting(setting) {
  let data = JSON.parse(localStorage.getItem(LS_KEY)) || {}
  return data[setting]
}

async function savePrivateSettings(settings) {
  let data = JSON.parse(localStorage.getItem(LS_KEY)) || {}
  Object.assign(data, settings)
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

// ------------------------------------------------------------------

// ------------------------ CodeBeamer ------------------------------

async function getCbHeaders() {
  let headers = {
    'Content-Type': 'application/json'
  };
  
  let username = await getPrivateSetting('cbUsername')
  let password = await getPrivateSetting('cbPassword')
  headers.Authorization = 'Basic ' + btoa(username + ":" + password)

  return headers
}

async function getCbBaseUrl() {
  return new URL((await getBoardSetting('cbAddress')) || '')
}

async function getCbApiBasePath() {
  return new URL('api/v3', await getCbBaseUrl())
}

async function getCodeBeamerItemURL(id) {
  return new URL(`issue/${id}`, await getCbBaseUrl())
}

async function getCodeBeamerItems() {
  try {
    const cbItems = await fetch(`${await getCbApiBasePath()}/items/query?page=1&pageSize=500&queryString=tracker.id%20IN%20%2813413%29`, {
      method: 'GET',
      headers: await getCbHeaders(),
    })
      .then(res => res.json())
    return cbItems.items
  } catch (error) {
    console.log('Error while getting items from codeBeamer', error)
  }
}

// not needed if we use query directly (details are already there)
async function getCodeBeamerItemDetails(item) {
  return await fetch(`${await getCbApiBasePath()}/items/${item.id}`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

async function getCodeBeamerWiki2Html(markup, trackerItem) {
  let body = {
    contextId: trackerItem.id,
    contextVersion: trackerItem.version,
    renderingContextType: "TRACKER_ITEM",
    markup: markup
  }
  return await fetch(`${await getCbApiBasePath()}/projects/${trackerItem.tracker.project.id}/wiki2html`, {
    method: 'POST',
    headers: await getCbHeaders(),
    body: JSON.stringify(body),
  })
    .then(res => res.text())
}

async function getCodeBeamerTrackerDetails(tracker) {
  return await fetch(`${await getCbApiBasePath()}/trackers/${tracker.id}`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

async function getCodeBeamerOutgoingAssociations(item) {
  const itemRelations = await fetch(`${await getCbApiBasePath()}/items/${item.id}/relations`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
  return itemRelations.outgoingAssociations
}

async function getCodeBeamerAccociationDetails(association) {
  return await fetch(`${await getCbApiBasePath()}/associations/${association.id}`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

async function addNewCbItem(item) {
  let inboxTrackerId = getBoardSetting('inboxTrackerId')
  return await fetch(`${await getCbApiBasePath()}/trackers/${inboxTrackerId}/items`, {
    method: 'POST',
    headers: await getCbHeaders(),
    body: JSON.stringify(item),
  })
    .then(res => res.json())
}

// ------------------------------------------------------------------


// ------------------------ Converter ------------------------------

function findColorFieldOnItem(item) {
  var colorField = item.customFields ? item.customFields.find(field => field.type === 'ColorFieldValue') : null
  return colorField ? colorField.value : null
}

async function convert2Card(item) {
  let cardData = {
    type: 'CARD',
    title: `<a href="${await getCodeBeamerItemURL(item.id)}">[${item.tracker.keyName}-${item.id}] - ${item.name}</a>`,
    description: item.renderedDescription,
    card: {
      logo: {
        iconUrl: `${window.location.href}src/img/codeBeamer-Logo-BW.png`
      },
      customFields: [
        {
          mainColor: '#4f8ae8', // light blue
          fontColor: '#ffffff', // white
          value: `Status: ${item.status.name}`,
        }, {
          value: `Release: ${item.release ? item.release.name : '--'}`
        },
      ],
    },
    capabilities: {
      editable: false
    },
    metadata: {
      [miro.getClientId()]: {
        id: item.id,
      },
    },
  }

  // background Color
  let colorFieldValue = findColorFieldOnItem(item)
  let backgroundColor = colorFieldValue ? colorFieldValue
    : item.tracker.color ? item.tracker.color
      : null
  if (backgroundColor) {
    cardData.style = { backgroundColor: backgroundColor }
  }

  if (item[NEWPOS]) {
    cardData.x = item[NEWPOS].x
    cardData.y = item[NEWPOS].y
  }

  return cardData
}

function lineStyleByAssociationType(associationDetails) {
  let style = {
    lineType: 2, // ARROW: = 2, ARROW_SKETCH: = 9, LINE: = 1
    lineStyle: 2, // DASHED = 1, NORMAL = 2, STRONG = 3, DOTTED = 4
    lineEndStyle: 1, // ARC_ARROW: = 1, ARROW: = 6, CIRCLE: = 4, FILLED_ARROW: = 8, FILLED_CIRCLE: = 5, FILLED_RHOMBUS: = 3, NONE: = 0, OPEN_ARROW: = 7, RHOMBUS: = 2
    lineStartStyle: 0, // see above
    lineThickness: 1,
  }

  switch (associationDetails.type.id) {
    case 1: // depends
      style.lineColor = '#cf7f30' // orange
      style.lineEndStyle = 6
      lineThickness = 5
      break;
    case 4: // related
    case 9: // copy of
      style.lineColor = '#21cfb7' // turquise
      style.lineStyle = 1
      style.lineStartStyle = 1
      break;
    case 6: // violates
    case 8: // invalidates
    case 7: // excludes
      style.lineColor = '#b32525' // red
      break;
    case 2: // parent
    case 3: // child
    case 5: // derived
    default:
    // leave default
  }
  return style
}

function convert2Line(associationDetails, fromCardId, toCardId) {
  let lineData = {
    type: 'LINE',
    startWidgetId: fromCardId,
    endWidgetId: toCardId,
    style: lineStyleByAssociationType(associationDetails),
    capabilities: {
      editable: false
    },
    metadata: {
      [miro.getClientId()]: {
        id: associationDetails.id,
      },
    },
  }
  return lineData
}

function strip(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent;
}

function convert2CbItem(widget) {
  let item = {
    name: "New Item",
    description: "--"
  }
  switch (widget.type) {
    case 'CARD':
      nameNoHtml = strip(widget.title)
      if (nameNoHtml)
        item.name = nameNoHtml
      if (widget.description)
        item.description = widget.description
      break;
    case 'SHAPE':
    case 'STICKER':
      if (widget.plainText)
        item.name = widget.plainText
      break;
    case 'TEXT':
      if (widget.text)
        item.name = widget.text
      break;
    default:
      throw `Widget type '${widget.type}' not supported`
  }
  return item
}

// ------------------------------------------------------------------



// ------------------------ Miro ------------------------------

async function getWidgetDetail(widget) {
  return (await miro.board.widgets.get(widget))[0]
}

async function findWidgetByTypeAndMetadataId(widgetData) {
  let appId = miro.getClientId()
  return (
    (await miro.board.widgets.get({
      type: widgetData.type,
    })))
    .filter(widget => !!widget.metadata[appId])
    .find(widget => widget.metadata[appId].id === widgetData.metadata[appId].id)
}

async function findSettingsWidget() {
  let appId = miro.getClientId()
  return (
    (await miro.board.widgets.get({
      type: 'SHAPE',
    })))
    .filter(widget => !!widget.metadata[appId])
    .find(widget => !!widget.metadata[appId].settings)
}

async function findLinesByFromCard(fromCardId) {
  return (
    (await miro.board.widgets.get({
      type: 'LINE',
    })))
    .filter(line => line.metadata[miro.getClientId()] && line.startWidgetId === fromCardId)
}

async function createOrUpdateWidget(widgetData) {
  const existingWidget = await findWidgetByTypeAndMetadataId(widgetData);
  if (existingWidget) {
    widgetData.id = existingWidget.id
    return await updateWidget(widgetData)
  } else {
    return await createWidget(widgetData)
  }
}

async function createWidget(widgetData) {
  let widget = (await miro.board.widgets.create(widgetData))[0]
  console.log(`${widget.type} widget ${widget.id} has been created to match item ${widget.metadata[miro.getClientId()].id}`)
  return widget
}

async function updateWidget(widgetData) {
  let widget = (await miro.board.widgets.update(widgetData))[0]
  let itemId = widget.metadata[miro.getClientId()].id
  console.log(`${widget.type} widget ${widget.id} has been updated to match item ${itemId ? itemId : '<the settings>'}`)
  return widget
}

async function deleteWidget(widgetData) {
  return await miro.board.widgets.deleteById(widgetData)
}


// -----------------------------------------------------------------