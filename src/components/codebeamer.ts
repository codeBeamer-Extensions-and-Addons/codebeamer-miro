import { getWidgetDetail, deleteWidget, createOrUpdateWidget } from "./miro";
import { convert2CbItem, convert2Card } from "./converter";
import { getPrivateSetting } from "./utils";
import Store from './store';
import { BoardSetting, Constants, PrivateSetting } from "./constants";

const store = Store.getInstance();

async function getCbHeaders() {
  let headers = new Headers({
    'Content-Type': 'application/json'
  })

  let username = await getPrivateSetting(PrivateSetting.CB_USERNAME)
  let password = await getPrivateSetting(PrivateSetting.CB_PASSWORD)
  headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

  return headers
}

function getCbBaseUrl() {
  return new URL(store.getBoardSetting(BoardSetting.CB_ADDRESS))
}

function getCbApiBasePath() {
  let url = getCbBaseUrl()
  url.pathname = url.pathname + '/api/v3'
  return url
}

export function getCodeBeamerItemURL(id) {
  let url = getCbBaseUrl()
  url.pathname = url.pathname + `/issue/${id}`
  return url
}

export async function getCodeBeamerCbqlResult(cbqlQuery, page = 1, pageSize = 500) {
  try {
    let url = getCbApiBasePath()
    url.pathname = url.pathname + '/items/query'
    url.search = `page=${page}&pageSize=${pageSize}&queryString=${cbqlQuery}`
    const queryResult = await fetch(url.toString(), {
      method: 'GET',
      headers: await getCbHeaders(),
    })
      .then(res => res.json())
    return queryResult
  } catch (error) {
    console.log('Error while getting items from codeBeamer', error)
  }
}

// not needed if we use query directly (details are already there)
async function getCodeBeamerItemDetails(item) {
  return await fetch(`${getCbApiBasePath()}/items/${item.id}`, {
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
  return await fetch(`${getCbApiBasePath()}/projects/${trackerItem.tracker.project.id}/wiki2html`, {
    method: 'POST',
    headers: await getCbHeaders(),
    body: JSON.stringify(body),
  })
    .then(res => res.text())
}

// throws error if not OK
export function cbConnectionCheck(){
  return getCodeBeamerProjectTrackers()
    .then(res => {
      if (res.message) throw new Error(res.message)
      return true
    })
}

export async function getCodeBeamerProjectTrackers(projectID = undefined) {
  if (!projectID) projectID = Store.getInstance().getBoardSetting(BoardSetting.PROJECT_ID)
  return await fetch(`${getCbApiBasePath()}/projects/${projectID}/trackers`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

async function getCodeBeamerTrackerDetails(tracker) {
  return await fetch(`${getCbApiBasePath()}/trackers/${tracker.id}`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

export async function getCodeBeamerOutgoingAssociations(item) {
  const itemRelations = await fetch(`${getCbApiBasePath()}/items/${item.id}/relations`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
  return itemRelations.outgoingAssociations
}

export async function getCodeBeamerAssociationDetails(association) {
  return await fetch(`${getCbApiBasePath()}/associations/${association.id}`, {
    method: 'GET',
    headers: await getCbHeaders(),
  })
    .then(res => res.json())
}

async function addNewCbItem(item) {
  return await fetch(`${getCbApiBasePath()}/trackers/${store.getBoardSetting(BoardSetting.INBOX_TRACKER_ID)}/items`, {
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
  cbItem[Constants.NEWPOS] = { x: widget.x, y: widget.y }
  deleteWidget(widget) // dont wait
  await createOrUpdateCbItem(cbItem)
  miro.board.selection.selectWidgets({ id: cbItem.card.id })
  // delete old widget

  // no need to sync associations as the item was just created. Need to change if we add ability to link from miro
}