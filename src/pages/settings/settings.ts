import { BoardSetting } from "../../entities/board-setting.enum";
import { LocalSetting } from "../../entities/local-setting.enum";
import { SessionSetting } from "../../entities/session-setting.enum";
import CodeBeamerService from "../../services/codebeamer";
import MiroService from "../../services/miro";
import Store from "../../services/store";

let store: Store;
let codeBeamerService: CodeBeamerService;
let miroService: MiroService;

miro.onReady(async () => {
  store = Store.create(miro.getClientId(), (await miro.board.info.get()).id);
  codeBeamerService = CodeBeamerService.getInstance();
  miroService = MiroService.getInstance();

  loadFieldValuesFromStorage();
})

function loadFieldValuesFromStorage(): void {
  setFieldFromBoardSettings(BoardSetting.CB_ADDRESS)
  setFieldFromBoardSettings(BoardSetting.INBOX_TRACKER_ID)
  setFieldFromBoardSettings(BoardSetting.PROJECT_ID)
  setFieldFromPrivateSettings(LocalSetting.CB_USERNAME)
  setFieldFromSessionSettings(SessionSetting.CB_PASSWORD)
}

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

async function saveAndTestSettings() {
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


  await codeBeamerService.getCodeBeamerUser()
    .then((cbUser) => {
      miroService.getCurrentUserId().then((miroUserId) => {
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
if (saveButton) saveButton.onclick = saveAndTestSettings
