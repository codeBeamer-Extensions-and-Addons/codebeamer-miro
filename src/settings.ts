import { savePrivateSettings, getPrivateSetting } from './components/utils';
import Store from './components/store';
import { BoardSetting, PrivateSetting } from './components/constants';
import { cbConnectionCheck } from './components/codebeamer'

function setFieldFromPrivateSettings(fieldIdAndSettingName: PrivateSetting) {
  return getPrivateSetting(fieldIdAndSettingName).then(value => {
    if (value) {
      let field = document.getElementById(fieldIdAndSettingName)
      if (field) field["value"] = value
    }
  })
}

function setFieldFromBoardSettings(fieldIdAndSettingName: BoardSetting) {
  let value = Store.getInstance().getBoardSetting(fieldIdAndSettingName)
  if (value) {
    let field = document.getElementById(fieldIdAndSettingName)
    if (field) field["value"] = value
  }
}

function addValueOfFieldToObject(object: any, fieldId: BoardSetting | PrivateSetting) {
  let field = document.getElementById(fieldId)
  object[fieldId] = field ? field["value"] : null
  return object
}

async function saveButtonOnClick() {
  let boardSettings = {}
  addValueOfFieldToObject(boardSettings, BoardSetting.CB_ADDRESS)
  addValueOfFieldToObject(boardSettings, BoardSetting.INBOX_TRACKER_ID)
  addValueOfFieldToObject(boardSettings, BoardSetting.PROJECT_ID)
  let privateSettings = {}
  addValueOfFieldToObject(privateSettings, PrivateSetting.CB_USERNAME)
  addValueOfFieldToObject(privateSettings, PrivateSetting.CB_PASSWORD)

  await Promise.all([
    Store.getInstance().saveBoardSettings(boardSettings),
    savePrivateSettings(privateSettings)
  ])

  await cbConnectionCheck()
    .then(() => {
      miro.showNotification('CB Connection OK!')
      miro.board.ui.closeModal()
    })
    .catch(err => miro.showNotification(`CB Connection could not be established: ${err}`))
}

let saveButton = document.getElementById('saveButton')
if (saveButton) saveButton.onclick = saveButtonOnClick

Store.getInstance().onPluginReady(async () => {
  setFieldFromBoardSettings(BoardSetting.CB_ADDRESS)
  setFieldFromBoardSettings(BoardSetting.INBOX_TRACKER_ID)
  setFieldFromBoardSettings(BoardSetting.PROJECT_ID)
  setFieldFromPrivateSettings(PrivateSetting.CB_USERNAME)
  setFieldFromPrivateSettings(PrivateSetting.CB_PASSWORD)
})