import { getWidgetDetail, deleteWidget, createOrUpdateWidget } from "./miro";
import { convert2CbItem, convert2Card } from "./converter";
import Store from './store';
import { BoardSetting, Constants, LocalSetting } from "./constants";
import { CodeBeamerItem, CodeBeamerRelation, CodeBeamerTracker, CodeBeamerTrackerTypeReference } from "types/codeBeamer.types";

const store = Store.getInstance();

async function checkForCbError(res: Response): Promise<any> {
  if (!res.ok)
    throw new Error(res.statusText);
  let json = await res.json()
  if (json.message)
    throw new Error(json.message)
  return json
}

function getCbHeaders(): Headers {
  let headers = new Headers({
    'Content-Type': 'application/json'
  })

  let username = store.getLocalSetting(LocalSetting.CB_USERNAME)
  let password = store.getLocalSetting(LocalSetting.CB_PASSWORD)
  headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

  return headers
}

function getCbBaseUrl(): URL {
  let cbAddress = store.getBoardSetting(BoardSetting.CB_ADDRESS)
  return new URL(cbAddress)
}

function getCbApiBasePath(): URL {
  let url = getCbBaseUrl()
  url.pathname = url.pathname + '/api/v3'
  return url
}

export function getCodeBeamerItemURL(id: number): URL {
  let url = getCbBaseUrl()
  url.pathname = url.pathname + `/issue/${id}`
  return url
}

export async function getCodeBeamerCbqlResult(cbqlQuery: string, page: number = 1, pageSize: number = 500): Promise<any> {
  try {
    let url = getCbApiBasePath()
    url.pathname = url.pathname + '/items/query'
    url.search = `page=${page}&pageSize=${pageSize}&queryString=${cbqlQuery}`
    return fetch(url.toString(), {
      method: 'GET',
      headers: getCbHeaders(),
    })
      .then(checkForCbError)
  } catch (error) {
    console.log('Error while getting items from codeBeamer', error)
  }
}

// not needed if we use query directly (details are already there)
async function getCodeBeamerItemDetails(item) {
  return fetch(`${getCbApiBasePath()}/items/${item.id}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

async function getCodeBeamerWiki2Html(markup: string, trackerItem): Promise<string> {
  let body = {
    contextId: trackerItem.id,
    contextVersion: trackerItem.version,
    renderingContextType: "TRACKER_ITEM",
    markup: markup
  }
  return fetch(`${getCbApiBasePath()}/projects/${trackerItem.tracker.project.id}/wiki2html`, {
    method: 'POST',
    headers: getCbHeaders(),
    body: JSON.stringify(body),
  })
    .then(res => res.text())
}

export function getCodeBeamerUser(username: string | undefined = undefined): Promise<any> {
  if (!username) username = Store.getInstance().getLocalSetting(LocalSetting.CB_USERNAME)
  return fetch(`${getCbApiBasePath()}/users/findByName?name=${username}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

export async function getCodeBeamerProjectTrackers(projectID: number | undefined = undefined): Promise<any> {
  if (!projectID) projectID = Store.getInstance().getBoardSetting(BoardSetting.PROJECT_ID)
  return fetch(`${getCbApiBasePath()}/projects/${projectID}/trackers`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

async function getCodeBeamerTrackerDetails(tracker: CodeBeamerTracker | CodeBeamerTrackerTypeReference) {
  return fetch(`${getCbApiBasePath()}/trackers/${tracker.id}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}


export async function getCodeBeamerOutgoingRelations(item: CodeBeamerItem): Promise<CodeBeamerRelation[]> {
  const itemRelations = await fetch(`${getCbApiBasePath()}/items/${item.id}/relations`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
  return itemRelations.outgoingAssociations.concat(itemRelations.upstreamReferences)
}

export async function getCodeBeamerAssociationDetails(association: CodeBeamerRelation): Promise<any> {
  return fetch(`${getCbApiBasePath()}/associations/${association.id}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

async function addNewCbItem(item): Promise<any> {
  return fetch(`${getCbApiBasePath()}/trackers/${store.getBoardSetting(BoardSetting.INBOX_TRACKER_ID)}/items`, {
    method: 'POST',
    headers: getCbHeaders(),
    body: JSON.stringify(item),
  })
    .then(checkForCbError)
}

async function enrichBaseCbItemWithDetails(cbItem): Promise<any> {
  cbItem.tracker = await getCodeBeamerTrackerDetails(cbItem.tracker)
  cbItem.renderedDescription =
    cbItem.description
      ? (cbItem.descriptionFormat === 'Wiki'
        ? await getCodeBeamerWiki2Html(cbItem.description, cbItem)
        : cbItem.description)
      : ""
  return cbItem
}

export async function createOrUpdateCbItem(cbItem): Promise<any> {
  await enrichBaseCbItemWithDetails(cbItem)
  let cardData = await convert2Card(cbItem)
  cbItem.card = await createOrUpdateWidget(cardData)
  return cbItem
}

export async function submitNewCodeBeamerItem(widget): Promise<void> {
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