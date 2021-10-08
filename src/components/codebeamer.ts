import { getWidgetDetail, deleteWidget, createOrUpdateWidget } from "./miro";
import { convert2CbItem, convert2Card, CreateCbItem } from "./converter";
import Store from './store';
import { BoardSetting, Constants, LocalSetting } from "./constants";
import * as sanitizeHtml from 'sanitize-html';

const store = Store.getInstance();

export const RELATION_OUT_ASSOCIATION_TYPE = "OutgoingTrackerItemAssociation"
export const RELATION_UPSTREAM_REF_TYPE = "UpstreamTrackerItemReference"

/**
 * Checks, whether given response is "ok" (res.ok == true). 
 * If it isn't or there's a message on the res; throws an error containing the statusText.
 * If it is, returns the response in json format.
 * @param res HTTP response in question
 * @returns res.json()
 */
function checkForCbError(res) {
  if (!res.ok){
    console.error(res);
    throw new Error(res.statusText);
  }
  let json = res.json()
  if (json.message)
    throw new Error(json.message)
  return json
}

/**
 * Constructs the HTTP request headers for a codeBeamer API request.
 * Including content-type and authorization, the latter based on the credentials entered on the settings page.
 * @returns HTTP request headers with content-type and authorization specified.
 */
function getCbHeaders() {
  let headers = new Headers({
    'Content-Type': 'application/json'
  })

  let username = store.getLocalSetting(LocalSetting.CB_USERNAME)
  let password = store.getLocalSetting(LocalSetting.CB_PASSWORD)
  //? use digest? that way, the pw can be stored as part of the hashed HA1..
  //* problem: cb API expects Basic auth.
  headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

  return headers
}

function getCbBaseUrl() {
  let cbAddress = store.getBoardSetting(BoardSetting.CB_ADDRESS)
  return new URL(cbAddress)
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

async function getCodeBeamerWiki2Html(markup, trackerItem) {
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

/**
 * Fetches a user's data from the cb API.
 * @param username Cb username of the user in question
 * @returns Userdata in JSON format
 */
export function getCodeBeamerUser(username = undefined) {
  if (!username) username = Store.getInstance().getLocalSetting(LocalSetting.CB_USERNAME)
  return fetch(`${getCbApiBasePath()}/users/findByName?name=${username}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
  .then(checkForCbError)
}

export async function getCodeBeamerProjectTrackers(projectID = undefined) {
  if (!projectID) projectID = Store.getInstance().getBoardSetting(BoardSetting.PROJECT_ID)
  return fetch(`${getCbApiBasePath()}/projects/${projectID}/trackers`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

async function getCodeBeamerTrackerDetails(tracker) {
  return fetch(`${getCbApiBasePath()}/trackers/${tracker.id}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

export async function getCodeBeamerOutgoingRelations(item) {
  const itemRelations = await fetch(`${getCbApiBasePath()}/items/${item.id}/relations`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
  return itemRelations.outgoingAssociations.concat(itemRelations.upstreamReferences)
}

export async function getCodeBeamerAssociationDetails(association) {
  return fetch(`${getCbApiBasePath()}/associations/${association.id}`, {
    method: 'GET',
    headers: getCbHeaders(),
  })
    .then(checkForCbError)
}

/**
 * Creates a codeBeamer item based on a miro item.
 * The item is created in the "Inbox tracker" defined by it's id in the settings.
 * If any part of the operation fails, the settings modal is opened and an error message is displayed.
 * @param item CbItem to create
 * @returns Response from the cb API.
 */
async function addNewCbItem(item: CreateCbItem) {
  let trackerId = store.getBoardSetting(BoardSetting.INBOX_TRACKER_ID);
  if(!trackerId) {
      miro.board.ui.openModal('settings.html');
      miro.showErrorNotification('You must define an inbox tracker id to create items!')
  }
  if(item.description) {
    item.description = sanitizeHtml(
      item.description,
      { 
        allowedTags: [], 
        allowedAttributes: {} 
      });
  }
  return fetch(`${getCbApiBasePath()}/trackers/${trackerId}/items`, {
    method: 'POST',
    headers: getCbHeaders(),
    body: JSON.stringify(item),
  })
    .then(checkForCbError)
    .catch(err => {
      miro.board.ui.openModal('settings.html');
      miro.showErrorNotification(`Please verify the settings are correct. Error: ${err}`)
    })
}

async function enrichBaseCbItemWithDetails(cbItem) {
  cbItem.tracker = await getCodeBeamerTrackerDetails(cbItem.tracker)
  cbItem.renderedDescription =
    cbItem.description
      ? (cbItem.descriptionFormat === 'Wiki'
        ? await getCodeBeamerWiki2Html(cbItem.description, cbItem)
        : cbItem.description)
      : ""
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