var BASE_PATH = 'http://localhost:8080/cb/api/v3'
var CB_HEADERS = {
  'Authorization': `Basic YWRtaW46YWRtaW4=`, // admin/admin
  'Content-Type': 'application/json'
};

const appConfig = {
  boardId: 'o9J_leqKY7I=',
}

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Some title',
        svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
        onClick: syncWithCodeBeamer,
      }
    }
  })
})

async function syncWithCodeBeamer() {
  alert("The URL of this page is: " + window.location.href)
  var appId = miro.getClientId()
  const boardApiService = new MiroBoardApiService(appConfig, appId)

  await getCodeBeamerItems()
    .then(async cbItems => {
      let associationsMetaData = []
      await Promise.all(cbItems.map(async cbItem => {
        cbItem.tracker = await getCodeBeamerTrackerDetails(cbItem.tracker)
        cbItem.renderedDescription = //cbItem.description
          // HTML rendering does not display correctly on Miro - would need to either adapt the rendering or render on our own - codeBeamer specific HTML...  
          cbItem.descriptionFormat === 'Wiki'
            ? await getCodeBeamerWiki2Html(cbItem.description, cbItem)
            : cbItem.description
        let cardData = convert2Card(cbItem, appId)
        const fromCard = await boardApiService.createOrUpdateWidget(cardData)
        return getCodeBeamerOutgoingAssociations(cbItem)
          .then(associations => associationsMetaData.push({ fromCardId: fromCard.id, associations: associations }))
      }))

      return Promise.all(associationsMetaData.map(async associationsMetaDataEntry => {
        const existingLines = await boardApiService.findLinesByFromCard(associationsMetaDataEntry.fromCardId)
        // delete lines which are no longer present that originate on any of the items synched above
        deletionTask = Promise.all(existingLines.map(async line => {
          if (!associationsMetaDataEntry.associations.find(association => line.metadata[appId].id === association.id)) {
            console.log(`deleting line ${line.id} because the association ${line.metadata[appId].id} does not exist anymore`)
            return boardApiService.deleteWidget(line)
          } else return Promise.resolve()
        }))
        // add or update lines
        additionTask = Promise.all(associationsMetaDataEntry.associations.map(async association => {
          const toCard = await boardApiService.findWidgetByTypeAndMetadataId({ type: 'card', metadata: { [appId]: { id: association.itemRevision.id } } });
          console.log(`Association ${association.id}: card for codeBeamer ID ${association.itemRevision.id} is: ${toCard ? toCard.id : 'NOT FOUND'}`)
          if (toCard) {
            let associationDetails = await getCodeBeamerAccociationDetails(association)
            console.log(`Association Details: ${JSON.stringify(associationDetails)}`)
            return boardApiService.createOrUpdateWidget(convert2Line(associationDetails, associationsMetaDataEntry.fromCardId, toCard.id, appId))
          } else return Promise.resolve()
        }))
        return Promise.all([deletionTask, additionTask])
      }))
    })

  miro.showNotification('Sync with codeBeamer finished!')
}



// ------------------------ CodeBeamer ------------------------------

async function getCodeBeamerItems() {
  try {
    const cbItems = await fetch(`${BASE_PATH}/items/query?page=1&pageSize=500&queryString=tracker.id%20IN%20%2813413%29`, {
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
  return await fetch(`${BASE_PATH}/items/${item.id}`, {
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
  return await fetch(`${BASE_PATH}/projects/${trackerItem.tracker.project.id}/wiki2html`, {
    method: 'POST',
    headers: CB_HEADERS,
    body: JSON.stringify(body),
  })
    .then(res => res.text())
}

async function getCodeBeamerTrackerDetails(tracker) {
  return await fetch(`${BASE_PATH}/trackers/${tracker.id}`, {
    method: 'GET',
    headers: CB_HEADERS,
  })
    .then(res => res.json())
}

async function getCodeBeamerOutgoingAssociations(item) {
  const itemRelations = await fetch(`${BASE_PATH}/items/${item.id}/relations`, {
    method: 'GET',
    headers: CB_HEADERS,
  })
    .then(res => res.json())
  return itemRelations.outgoingAssociations
}

async function getCodeBeamerAccociationDetails(association) {
  return await fetch(`${BASE_PATH}/associations/${association.id}`, {
    method: 'GET',
    headers: CB_HEADERS,
  })
    .then(res => res.json())
}

// ------------------------------------------------------------------


// ------------------------ Converter ------------------------------

function findColorFieldOnItem(item) {
  var colorField = item.customFields ? item.customFields.find(field => field.type === 'ColorFieldValue') : null
  return colorField ? colorField.value : null
}

function convert2Card(item, appId) {
  let cardData = {
    type: 'card',
    title: `<a href="http://localhost:8080/cb/issue/${item.id}">[${item.tracker.keyName}-${item.id}] - ${item.name}</a>`,
    description: item.renderedDescription,
    card: {
      logo: {
        iconUrl: 'https://max-poprawe.github.io/codebeamer-miro/src/img/codeBeamer-Logo-BW.png'
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
    cardData.style = {backgroundColor: backgroundColor}
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

function convert2Line(associationDetails, fromCardId, toCardId, appId) {
  let lineData = {
    type: 'line',
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

// ------------------------------------------------------------------



// ------------------------ Miro ------------------------------

class MiroBoardApiService {
  constructor(miroProperties, appId) {
    this._miro = miroProperties
    this.appId = appId
  }

  async findWidgetByTypeAndMetadataId(widgetData) {
    return (
      (await miro.board.widgets.get({
        type: widgetData.type,
      })))
      .filter((widget) => !!widget.metadata[this.appId])
      .find((widget) => widget.metadata[this.appId].id === widgetData.metadata[this.appId].id)
  }

  async findLinesByFromCard(fromCardId) {
    return (
      (await miro.board.widgets.get({
        type: 'line',
      })))
      .filter((line) => line.metadata[this.appId] && line.startWidgetId === fromCardId)
  }

  async createOrUpdateWidget(widgetData) {
    const existingWidget = await this.findWidgetByTypeAndMetadataId(widgetData);
    if (existingWidget) {
      widgetData.id = existingWidget.id
      return await this.updateWidget(widgetData)
    } else {
      return await this.createWidget(widgetData)
    }
  }

  async createWidget(widgetData) {
    let widget = (await miro.board.widgets.create(widgetData))[0]
    console.log(`${widget.type} widget ${widget.id} has been created to match item ${widget.metadata[this.appId].id}`)
    return widget
  }

  async updateWidget(widgetData) {
    let widget = (await miro.board.widgets.update(widgetData))[0]
    console.log(`${widget.type} widget ${widget.id} has been updated to match item ${widget.metadata[this.appId].id}`)
    return widget
  }

  async deleteWidget(widgetData) {
    return await miro.board.widgets.deleteById(widgetData)
  }
}

// ------------------------------------------------------------------