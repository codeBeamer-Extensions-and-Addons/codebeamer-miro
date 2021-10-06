import Store from './components/store';
import { BoardSetting, LocalSetting } from './components/constants';
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
    let field = document.getElementById(fieldIdAndSettingName)
    if (field) field["value"] = value
  }
}

function addValueOfFieldToObject(object: any, fieldId: BoardSetting | LocalSetting) {
  let field = document.getElementById(fieldId)
  object[fieldId] = field ? field["value"] : null
  return object
}

async function saveButtonOnClick() {
  let boardSettings = {}
  addValueOfFieldToObject(boardSettings, BoardSetting.CB_ADDRESS)
  addValueOfFieldToObject(boardSettings, BoardSetting.INBOX_TRACKER_ID)
  addValueOfFieldToObject(boardSettings, BoardSetting.PROJECT_ID)
  let localSettings = {}
  addValueOfFieldToObject(localSettings, LocalSetting.CB_USERNAME)
  addValueOfFieldToObject(localSettings, LocalSetting.CB_PASSWORD)

  await Promise.all([
    store.saveBoardSettings(boardSettings),
    store.saveLocalSettings(localSettings)
  ])


  await getCodeBeamerUser()
    .then((cbUser) => {
      getCurrentUserId().then((miroUserId) => {
        store.storeUserMapping({ cbUserId: cbUser.id, miroUserId: miroUserId })
      })
      miro.showNotification('CB Connection OK!')
      miro.board.ui.closeModal()
    })
    .catch(err => {
      miro.showErrorNotification(`CB Connection could not be established: ${err}`)
      console.log("CB connection could not be established: ", err);
    })
}

let saveButton = document.getElementById('saveButton')
if (saveButton) saveButton.onclick = saveButtonOnClick

store.onPluginReady(async () => {
  setFieldFromBoardSettings(BoardSetting.CB_ADDRESS)
  setFieldFromBoardSettings(BoardSetting.INBOX_TRACKER_ID)
  setFieldFromBoardSettings(BoardSetting.PROJECT_ID)
  setFieldFromPrivateSettings(LocalSetting.CB_USERNAME)
  setFieldFromPrivateSettings(LocalSetting.CB_PASSWORD)
})