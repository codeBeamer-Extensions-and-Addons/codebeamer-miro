var CB_BASE_PATH = 'http://localhost:8080/cb/api/v3'
var INBOX_TRACKER_ID = 13413
var CB_HEADERS = {
  'Authorization': `Basic YWRtaW46YWRtaW4=`, // admin/admin
  'Content-Type': 'application/json'
};
var appId

const NEWPOS = "NEWPOS"
const UPLOAD_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 20C16 19.4477 16.4477 19 17 19H20V4H4V19H7C7.55228 19 8 19.4477 8 20C8 20.5523 7.55228 21 7 21H3C2.44772 21 2 20.5523 2 20V3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44771 22 3V20C22 20.5523 21.5523 21 21 21H17C16.4477 21 16 20.5523 16 20Z" fill="#050038"/><path d="M11 21.5V11.9142L9.41421 13.5C9.02369 13.8905 8.39052 13.8905 8 13.5C7.60948 13.1095 7.60948 12.4763 8 12.0858L12 8.08579L16 12.0858C16.3905 12.4763 16.3905 13.1095 16 13.5C15.6095 13.8905 14.9763 13.8905 14.5858 13.5L13 11.9142V21.5C13 22.0523 12.5523 22.5 12 22.5C11.4477 22.5 11 22.0523 11 21.5Z" fill="#050038"/></svg>'

miro.onReady(() => {
  appId = miro.getClientId()
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'CodeBeamer Integration',
        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
        onClick: syncWithCodeBeamer,
      },
      getWidgetMenuItems: function (selectedWidgets) {
        var menuItems = []
        if (isSelectionConvertable(selectedWidgets))
          menuItems.push(
            {
              tooltip: "Convert to codeBeamer Item",
              svgIcon: UPLOAD_ICON,
              onClick: () => submitNewCodeBeamerItem(selectedWidgets[0]),
            })
      },
    }
  })
  onAllWidgetsLoaded(() => {
    let settingsWidget = CreateOrHideSettingsItem()
    console.log(`codebeamer-miro settings are now hidden: ${settingsWidget.id}`)
  })
})

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
  return selectedWidgets.length === 1 && isWidgetConvertable(selectedWidgets[0])
}

function isWidgetConvertable(widget) {
  let supportedWidgetTypes = ['STICKER', 'CARD', 'TEXT', 'SHAPE']
  return (!widget.metadata || !widget.metadata[appId]) // only allow items NOT created by this plugin
    && supportedWidgetTypes.includes(widget.type) // only allow supported types
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
  let cardData = convert2Card(cbItem)
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
        const toCard = await findWidgetByTypeAndMetadataId({ type: 'CARD', metadata: { [appId]: { id: association.itemRevision.id } } });
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
async function CreateOrHideSettingsItem() {
  let settingsWidget = await findSettingsWidget()
  if (settingsWidget) {
    // hide settings
    settingsWidget.clientVisible = false
    await updateWidget(settingsWidget)
  } else {
    settingsWidget = await createWidget({
      type: 'SHAPE',
      clientVisible: false,
      metadata: {
        [appId]: {
          settings: {
            cbBasePath: '',
            cbUser: '',
            cbAuth: '',
            cbInboxTracker: '',
          },
        },
      },
    })
  }
  return settingsWidget
}

async function getSettings() {
  return (await findSettingsWidget()).metadata[appId].settings
}

async function saveSettings(settings){
  let settingsWidget = await findSettingsWidget()
  settingsWidget.metadata[appId].settings = settings
  return await updateWidget(settingsWidget)
}


// ------------------------------------------------------------------

// ------------------------ CodeBeamer ------------------------------

async function getCodeBeamerItems() {
  try {
    const cbItems = await fetch(`${CB_BASE_PATH}/items/query?page=1&pageSize=500&queryString=tracker.id%20IN%20%2813413%29`, {
      //const cbItems = await fetch(`${BASE_PATH}/trackers/13413/items?page=1&pageSize=500`, {
      method: 'GET',
      headers: CB_HEADERS,
    })
      .then(res => res.json())
    return cbItems.items
  } catch (error) {
    console.log('Error while getting items from codeBeamer', error)
  }
}

// not needed if we use query directly (details are already there)
async function getCodeBeamerItemDetails(item) {
  return await fetch(`${CB_BASE_PATH}/items/${item.id}`, {
    method: 'GET',
    headers: CB_HEADERS,
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
  return await fetch(`${CB_BASE_PATH}/projects/${trackerItem.tracker.project.id}/wiki2html`, {
    method: 'POST',
    headers: CB_HEADERS,
    body: JSON.stringify(body),
  })
    .then(res => res.text())
}

async function getCodeBeamerTrackerDetails(tracker) {
  return await fetch(`${CB_BASE_PATH}/trackers/${tracker.id}`, {
    method: 'GET',
    headers: CB_HEADERS,
  })
    .then(res => res.json())
}

async function getCodeBeamerOutgoingAssociations(item) {
  const itemRelations = await fetch(`${CB_BASE_PATH}/items/${item.id}/relations`, {
    method: 'GET',
    headers: CB_HEADERS,
  })
    .then(res => res.json())
  return itemRelations.outgoingAssociations
}

async function getCodeBeamerAccociationDetails(association) {
  return await fetch(`${CB_BASE_PATH}/associations/${association.id}`, {
    method: 'GET',
    headers: CB_HEADERS,
  })
    .then(res => res.json())
}

async function addNewCbItem(item) {
  return await fetch(`${CB_BASE_PATH}/trackers/${INBOX_TRACKER_ID}/items`, {
    method: 'POST',
    headers: CB_HEADERS,
    body: JSON.stringify(item),
  })
    .then(res => res.json())
}

function getCodeBeamerItemURL(id) {
  return `http://localhost:8080/cb/issue/${id}`
}

// ------------------------------------------------------------------


// ------------------------ Converter ------------------------------

function findColorFieldOnItem(item) {
  var colorField = item.customFields ? item.customFields.find(field => field.type === 'ColorFieldValue') : null
  return colorField ? colorField.value : null
}

function convert2Card(item) {
  let cardData = {
    type: 'CARD',
    title: `<a href="${getCodeBeamerItemURL(item.id)}">[${item.tracker.keyName}-${item.id}] - ${item.name}</a>`,
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
      [appId]: {
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
      [appId]: {
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
  return (
    (await miro.board.widgets.get({
      type: widgetData.type,
    })))
    .filter(widget => !!widget.metadata[this.appId])
    .find(widget => widget.metadata[this.appId].id === widgetData.metadata[this.appId].id)
}

async function findSettingsWidget() {
  return (
    (await miro.board.widgets.get({
      type: 'SHAPE',
    })))
    .filter(widget => !!widget.metadata[this.appId])
    .find(widget => !!widget.metadata[this.appId].settings)
}

async function findLinesByFromCard(fromCardId) {
  return (
    (await miro.board.widgets.get({
      type: 'LINE',
    })))
    .filter(line => line.metadata[this.appId] && line.startWidgetId === fromCardId)
}

async function createOrUpdateWidget(widgetData) {
  const existingWidget = await this.findWidgetByTypeAndMetadataId(widgetData);
  if (existingWidget) {
    widgetData.id = existingWidget.id
    return await this.updateWidget(widgetData)
  } else {
    return await this.createWidget(widgetData)
  }
}

async function createWidget(widgetData) {
  let widget = (await miro.board.widgets.create(widgetData))[0]
  console.log(`${widget.type} widget ${widget.id} has been created to match item ${widget.metadata[this.appId].id}`)
  return widget
}

async function updateWidget(widgetData) {
  let widget = (await miro.board.widgets.update(widgetData))[0]
  let itemId = widget.metadata[this.appId].id
  console.log(`${widget.type} widget ${widget.id} has been updated to match item ${itemId ? itemId : 'the settings'}`)
  return widget
}

async function deleteWidget(widgetData) {
  return await miro.board.widgets.deleteById(widgetData)
}


// -----------------------------------------------------------------