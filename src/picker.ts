import { syncWithCodeBeamer } from './main';
import { getCodeBeamerProjectTrackers, getCodeBeamerCbqlResult } from './components/codebeamer';
import Store from './components/store';
import { BoardSetting } from './components/constants';

Store.getInstance().onPluginReady(async () => {
  let trackersSelection = document.getElementById('selectedTracker') as HTMLSelectElement
  let importButton = document.getElementById('importButton')
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
    syncWithCodeBeamer(`item.id IN (${itemsToImport.join(',')})`)
}

async function trackerSelected() {
  let selectedTrackerElement = document.getElementById('selectedTracker') as HTMLSelectElement
  let selectedTracker = selectedTrackerElement.value

  let queryReturn = await getCodeBeamerCbqlResult(`tracker.id IN (${selectedTracker})`)
  populateDataTable(queryReturn.items)
  updateImportCountOnImportButton()
}

function selectAllOnChange() {
  let checkAllBox = document.getElementById('checkAll') as HTMLInputElement
  if (checkAllBox) {
    getCheckBoxesWithoutHeaderBox().forEach(item => item.checked = checkAllBox.checked)
    updateImportCountOnImportButton()
  }
}

function populateDataTable(data) {
  let pickedAttributeData = data.map(({ id, name }) => ({ ID: id, Name: name }))
  let table = document.getElementById("dataTable");
  if (table)
    table.innerHTML = ''
  generateTableContent(table, pickedAttributeData);
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

function generateTableContent(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    let cell = row.insertCell();
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
    for (let key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

function updateImportCountOnImportButton() {
  let importButton = document.getElementById('importButton')
  if (importButton) {
    importButton.innerText = `Import (${getCheckedItems().length})`
  }
}