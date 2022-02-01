import Store from './components/store';
import { BoardSetting, LocalSetting, SessionSetting } from './components/constants';
import { getCodeBeamerUser } from './components/codebeamer'
import { getCurrentUserId } from './components/miro'

const store = Store.getInstance();

function setFieldFromPrivateSettings(fieldIdAndSettingName: LocalSetting) {
  let value = store.getLocalSetting(fieldIdAndSettingName)
  if (value) {
    let field = document.getElementById(fieldIdAndSettingName)
    if (field) field["value"] = value
  }
}

function setFieldFromBoardSettings(fieldIdAndSettingName: BoardSetting) {
  let value = store.getBoardSetting(fieldIdAndSettingName)
  if (value) {
    let field = document.getElementById(fieldIdAndSettingName);
    if (field) field["value"] = value;
  }
}

function setFieldFromSessionSettings(fieldIdAndSettingName: SessionSetting) {
  let value = store.getSessionSetting(fieldIdAndSettingName)
  if(value) {
    let field = document.getElementById(fieldIdAndSettingName);
    if (field) field["value"] = value;
  }
}

function addValueOfFieldToObject(object: any, fieldId: BoardSetting | LocalSetting | SessionSetting) {
  let field = document.getElementById(fieldId);
  let value = field ? field["value"] : null;
  object[fieldId] = value;
  return object;
}

async function saveButtonOnClick() {
  let boardSettings = {}
  addValueOfFieldToObject(boardSettings, BoardSetting.CB_ADDRESS)
  addValueOfFieldToObject(boardSettings, BoardSetting.INBOX_TRACKER_ID)
  addValueOfFieldToObject(boardSettings, BoardSetting.PROJECT_ID)

  let localSettings = {}
  addValueOfFieldToObject(localSettings, LocalSetting.CB_USERNAME);

  let sessionSettings = {}
  addValueOfFieldToObject(sessionSettings, SessionSetting.CB_PASSWORD);

  await Promise.all([
    store.saveBoardSettings(boardSettings),
    store.saveLocalSettings(localSettings),
    store.saveSessionSettings(sessionSettings),
  ])


  await getCodeBeamerUser()
    .then((cbUser) => {
      getCurrentUserId().then((miroUserId) => {
        store.storeUserMapping({ cbUserId: cbUser.id, miroUserId: miroUserId })
      })
      miro.showNotification(`Connection with "${boardSettings["cbAddress"]}" API OK!`)
      miro.board.ui.closeModal()
    })
    .catch(err => {
      miro.showErrorNotification(`Connection to "${boardSettings["cbAddress"]}" API could not be established: ${err}`)
      console.error("CB connection could not be established: ", err);
    })
}

let saveButton = document.getElementById('saveButton')
if (saveButton) saveButton.onclick = saveButtonOnClick

store.onPluginReady(async () => {
  setFieldFromBoardSettings(BoardSetting.CB_ADDRESS)
  setFieldFromBoardSettings(BoardSetting.INBOX_TRACKER_ID)
  setFieldFromBoardSettings(BoardSetting.PROJECT_ID)
  setFieldFromPrivateSettings(LocalSetting.CB_USERNAME)
  setFieldFromSessionSettings(SessionSetting.CB_PASSWORD)
})