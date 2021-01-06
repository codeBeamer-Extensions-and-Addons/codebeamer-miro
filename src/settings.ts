import { onReady } from './main';
import { saveBoardSettings, getBoardSetting, savePrivateSettings, getPrivateSetting } from './components/utils';

function setFieldFromPrivateSettings(fieldIdAndSettingName) {
  return getPrivateSetting(fieldIdAndSettingName).then(value => {
    if (value) {
      let field = document.querySelector(`#${fieldIdAndSettingName}`)
      if (field) field["value"] = value
    }
  })
}

function setFieldFromBoardSettings(fieldIdAndSettingName) {
  return getBoardSetting(fieldIdAndSettingName).then(value => {
    if (value) {
      let field = document.querySelector(`#${fieldIdAndSettingName}`)
      if (field) field["value"] = value
    }
  })
}

function addValueOfFieldToObject(object, fieldId) {
  let field = document.getElementById(fieldId)
  object[fieldId] = field ? field["value"] : null
  return object
}



let saveButton = document.getElementById('saveButton')
if (saveButton)
  saveButton.addEventListener('click', () => {
    let boardSettings = {}
    addValueOfFieldToObject(boardSettings, 'cbAddress')
    addValueOfFieldToObject(boardSettings, 'inboxTrackerId')
    addValueOfFieldToObject(boardSettings, 'projectId')
    let privateSettings = {}
    addValueOfFieldToObject(privateSettings, 'cbUsername')
    addValueOfFieldToObject(privateSettings, 'cbPassword')

    return Promise.all([
      saveBoardSettings(boardSettings),
      savePrivateSettings(privateSettings)
    ]).then(() => { miro.showNotification('Saved!') })
  })

onReady(() => {
  setFieldFromBoardSettings('cbAddress')
  setFieldFromBoardSettings('inboxTrackerId')
  setFieldFromBoardSettings('projectId')
  setFieldFromPrivateSettings('cbUsername')
  setFieldFromPrivateSettings('cbPassword')
})