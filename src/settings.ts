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
  let field = document.querySelector(`#${fieldId}`)
  object[fieldId] = field ? field["value"] : null
  return object
}



let saveButton = document.querySelector('#saveButton')
console.log(`document: ${JSON.stringify(document)}`)
console.log(`save button: ${saveButton}`)
if (saveButton)
  saveButton.addEventListener('click', () => {
    let boardSettings = {}
    addValueOfFieldToObject(boardSettings, 'cbAddress')
    addValueOfFieldToObject(boardSettings, 'inboxTrackerId')
    addValueOfFieldToObject(boardSettings, 'cbqlQuery')
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
  setFieldFromBoardSettings('cbqlQuery')
  setFieldFromPrivateSettings('cbUsername')
  setFieldFromPrivateSettings('cbPassword')
})