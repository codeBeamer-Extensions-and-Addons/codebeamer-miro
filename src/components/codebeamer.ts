import Store from './store';
import { getWidgetDetail, deleteWidget, createOrUpdateWidget } from "./miro";
import { convert2CbItem, convert2Card } from "./converter";
import { getPrivateSetting, getBoardSetting } from "./utils";

const store = Store.getInstance();

async function getCbHeaders() {
  let headers = new Headers({
    'Content-Type': 'application/json'
  })

  let username = await getPrivateSetting('cbUsername')
  let password = await getPrivateSetting('cbPassword')
  headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

  return headers
}

async function getCbBaseUrl() {
  return new URL(await getBoardSetting('cbAddress'))
}

async function getCbApiBasePath() {
  let url = await getCbBaseUrl()
  url.pathname = url.pathname + '/api/v3'
  return url
}

export async function getCodeBeamerItemURL(id) {
  let url = await getCbBaseUrl()
  url.pathname = url.pathname + `/issue/${id}`
  return url
}

export async function getCodeBeamerItems() {
  try {
    let url = await getCbApiBasePath()
    url.pathname = url.pathname + '/items/query'
    url.search = `page=1&pageSize=500&queryString=${await getBoardSetting('cbqlQuery')}`
    const cbItems = await fetch(url.toString(), {
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

export async function getCodeBeamerOutgoingAssociations(item) {
  const itemRelations = await fetch(`${await getCbApiBasePath()}/items/${item.id}/relations`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
  return itemRelations.outgoingAssociations
}

export async function getCodeBeamerAssociationDetails(association) {
  return await fetch(`${await getCbApiBasePath()}/associations/${association.id}`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

async function addNewCbItem(item) {
  return await fetch(`${await getCbApiBasePath()}/trackers/${await getBoardSetting('inboxTrackerId')}/items`, {
    method: 'POST',
    headers: await getCbHeaders(),
    body: JSON.stringify(item),
  })
    .then(res => res.json())
}

async function enrichBaseCbItemWithDetails(cbItem) {
  cbItem.tracker = await getCodeBeamerTrackerDetails(cbItem.tracker)
  cbItem.renderedDescription = cbItem.descriptionFormat === 'Wiki'
    ? await getCodeBeamerWiki2Html(cbItem.description, cbItem)
    : cbItem.description
  return cbItem
}

export async function createOrUpdateCbItem(cbItem) {
  await enrichBaseCbItemWithDetails(cbItem)
  let cardData = await convert2Card(cbItem)
  cbItem.card = await createOrUpdateWidget(cardData)
  return cbItem
}

export async function submitNewCodeBeamerItem(widget) {
  // get widget with all meta data (the selected one only has the general widget properties, but is lacking the type specifcs)
  widget = await getWidgetDetail({ id: widget.id })
  // generate submission object and submit
  let submissionItem = convert2CbItem(widget)
  let cbItem = await addNewCbItem(submissionItem)
  // create new item in same position as old one
  cbItem[store.state.NEWPOS] = { x: widget.x, y: widget.y }
  deleteWidget(widget) // dont wait
  await createOrUpdateCbItem(cbItem)
  miro.board.selection.selectWidgets({ id: cbItem.card.id })
  // delete old widget

  // no need to sync associations as the item was just created. Need to change if we add ability to link from miro
}