import { syncWithCodeBeamer } from './main';
import { getAllSynchedCodeBeamerCardItemIds } from './components/miro'
import { getCodeBeamerProjectTrackers, getCodeBeamerCbqlResult } from './components/codebeamer';
import Store from './components/store';
import { BoardSetting } from './components/constants';

Store.getInstance().onPluginReady(async () => {
  let trackersSelection = document.getElementById('selectedTracker') as HTMLSelectElement
  let importButton = document.getElementById('importButton')
  let synchButton = document.getElementById('synchButton')
  if (trackersSelection && importButton) {
    var availableTrackers = await getCodeBeamerProjectTrackers(Store.getInstance().getBoardSetting(BoardSetting.PROJECT_ID))

    availableTrackers.forEach(element => {
      var opt = document.createElement("option");
      opt.value = element.id;
      opt.innerHTML = `[${element.id}] ${element.name}`;
      if (trackersSelection)
        trackersSelection.appendChild(opt);
    });

    trackersSelection.onchange = trackerSelected
    importButton.onclick = importItems
    updateImportCountOnImportButton()

  }
  if (synchButton) {
    synchButton.onclick = synchItems
    synchButton.innerText = `Update Synched Items (${(await getAllSynchedCodeBeamerCardItemIds()).length})`
  }
})

function getCheckBoxesWithoutHeaderBox() {
  let table = document.getElementById("dataTable");
  let checkBoxes: HTMLInputElement[] = []
  if (table) {
    let allInputs = table.getElementsByTagName('input')
    console.log(`got allInputs 1: ${allInputs.length}`)
    for (let index = 0; index < allInputs.length; index++) {
      const input = allInputs[index] as HTMLInputElement
      if (input.type.toLowerCase() == 'checkbox' && input.id != 'checkAll')
        checkBoxes.push(input)
    }
  }
  console.log(`got checkboxes: ${checkBoxes.length}`)
  return checkBoxes
}

function getCheckedItems() {
  return getCheckBoxesWithoutHeaderBox()
    .filter(item => item.checked)
    .map(item => item.id)
}

function importItems() {
  let itemsToImport = getCheckedItems()
  if (itemsToImport.length > 0)
    syncWithCodeBeamer(itemsToImport)
      .then(() => {
        miro.showNotification(`Successfully imported ${itemsToImport.length} items`)
        miro.board.ui.closeModal()
      })
      .catch(err => miro.showErrorNotification(err))
}

function synchItems() {
  return getAllSynchedCodeBeamerCardItemIds()
    .then(itemsToSynch => {
      if (itemsToSynch.length > 0)
        syncWithCodeBeamer(itemsToSynch)
          .then(() => {
            miro.showNotification(`Successfully updated ${itemsToSynch.length} items`)
            miro.board.ui.closeModal()
          })
          .catch(err => miro.showErrorNotification(err))
    })

}

async function trackerSelected() {
  let selectedTrackerElement = document.getElementById('selectedTracker') as HTMLSelectElement
  let selectedTracker = selectedTrackerElement.value

  let queryReturn = await getCodeBeamerCbqlResult(`tracker.id IN (${selectedTracker})`)
  await populateDataTable(queryReturn.items)
  updateImportCountOnImportButton()
}

function selectAllOnChange() {
  let checkAllBox = document.getElementById('checkAll') as HTMLInputElement
  if (checkAllBox) {
    getCheckBoxesWithoutHeaderBox().forEach(item => item.checked = checkAllBox.checked)
    updateImportCountOnImportButton()
  }
}

async function populateDataTable(data) {
  let pickedAttributeData = data.map(({ id, name }) => ({ ID: id, Name: name }))
  let table = document.getElementById("dataTable");
  if (table)
    table.innerHTML = ''
  await generateTableContent(table, pickedAttributeData);
  generateTableHead(table, pickedAttributeData);
}

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  let th = document.createElement("th");
  let label = document.createElement("label")
  label.className = "miro-checkbox"
  let input = document.createElement("input")
  input.type = "checkbox"
  input.id = "checkAll"
  input.onchange = selectAllOnChange
  let span = document.createElement("span")
  label.appendChild(input)
  label.appendChild(span)
  th.appendChild(label)
  row.appendChild(th);
  for (let key of Object.keys(data[0])) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

async function generateTableContent(table, data) {
  let alreadySynchedItems = await getAllSynchedCodeBeamerCardItemIds()
  for (let element of data) {
    let row = table.insertRow();
    let cell = row.insertCell();

    // if item is already synched, dont create checkbox
    if (alreadySynchedItems.some((val) => val == element.ID)) {
      let text = document.createTextNode('imported');
      cell.appendChild(text);
    } else {
      let label = document.createElement("label")
      label.className = "miro-checkbox"
      let input = document.createElement("input")
      input.type = "checkbox"
      input.id = element.ID
      input.onchange = updateImportCountOnImportButton
      let span = document.createElement("span")
      label.appendChild(input)
      label.appendChild(span)
      cell.appendChild(label)
    }

    for (let key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

function updateImportCountOnImportButton() {
  let importButton = document.getElementById('importButton') as HTMLButtonElement
  let checkedItemCount = getCheckedItems().length
  if (importButton) {
    importButton.innerText = `Import Selected (${checkedItemCount})`
    importButton.disabled = checkedItemCount == 0
  }
}