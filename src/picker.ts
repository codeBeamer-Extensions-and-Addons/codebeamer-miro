import { syncWithCodeBeamer } from './main';
import { getAllSynchedCodeBeamerCardItemIds } from './components/miro'
import { getCodeBeamerProjectTrackers, getCodeBeamerCbqlResult } from './components/codebeamer';
import Store from './components/store';
import { BoardSetting, LocalSetting } from './components/constants';

const store = Store.getInstance();
const itemsPerPage = 22

store.onPluginReady(async () => {
  let trackersSelection = document.getElementById('selectedTracker') as HTMLSelectElement
  let importButton = document.getElementById('importButton')
  let importButtonText = document.getElementById('importButtonText')
  let synchButton = document.getElementById('synchButton')
  let synchButtonText = document.getElementById('synchButtonText')
  let cbqlQuery = document.getElementById('cbqlQuery') as HTMLInputElement

  let cachedAdvancedSearchEnabled = store.getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED)

  if (cbqlQuery) {
    cbqlQuery.onchange = cbqlQueryOnChange
  }

  if (trackersSelection) {
    // build tracker options
    var availableTrackers = await getCodeBeamerProjectTrackers(store.getBoardSetting(BoardSetting.PROJECT_ID))
    availableTrackers.forEach(element => {
      var opt = document.createElement("option");
      opt.value = element.id;
      opt.innerHTML = `[${element.id}] ${element.name}`
      trackersSelection.appendChild(opt);
    })

    trackersSelection.onchange = trackersSelectionOnChange
  }

  // Execute switch to current selection to get HTML initialized correctly
  loadSearchAndResults(cachedAdvancedSearchEnabled)

  if (importButton && importButtonText) {
    importButton.onclick = importItems
    updateImportCountOnImportButton()
  }

  if (synchButton && synchButtonText) {
    synchButton.onclick = synchItems
    synchButtonText.innerText = `Update Synched Items (${(await getAllSynchedCodeBeamerCardItemIds()).length})`
  }
})

function getSwitchSearchButtonOnClick(switchToAdvanced: boolean) {
  return () => loadSearchAndResults(switchToAdvanced)
}

function loadSearchAndResults(advancedSearch: boolean) {
  store.saveLocalSettings({ [LocalSetting.ADVANCED_SEARCH_ENABLED]: advancedSearch })

  // make correct search visible
  let simpleSearchDiv = document.getElementById('simpleSearch')
  let advancedSearchDiv = document.getElementById('advancedSearch')
  if (simpleSearchDiv && advancedSearchDiv) {
    simpleSearchDiv.style.display = advancedSearch ? "none" : "block"
    advancedSearchDiv.style.display = advancedSearch ? "block" : "none"
  }

  // set up / change switch button text and onclick
  let switchSearchButton = document.getElementById('switchSearchButton')
  if (switchSearchButton) {
    switchSearchButton.innerText = advancedSearch ? "Switch to Tracker select" : "Switch to CBQL query input"
    switchSearchButton.onclick = getSwitchSearchButtonOnClick(!advancedSearch)
  }


  // init advanced search
  if (advancedSearch) {
    let cachedCbqlString = store.getLocalSetting(LocalSetting.CBQL_STRING)
    if (cachedCbqlString) {
      let cbqlQuery = document.getElementById('cbqlQuery') as HTMLInputElement
      cbqlQuery.value = cachedCbqlString
    }
    cbqlQueryOnChange()
  } else { // init simple search
    let cachedSelectedTracker = store.getLocalSetting(LocalSetting.SELECTED_TRACKER)
    // look if cached tracker is available on project and select it if it is
    if (cachedSelectedTracker) {
      let trackersSelection = document.getElementById('selectedTracker') as HTMLSelectElement
      for (let i = 0; i < trackersSelection.options.length; i++) {
        const option = trackersSelection.options[i];
        if (option.value == cachedSelectedTracker) {
          trackersSelection.value = option.value
        }
      }
    }
    trackersSelectionOnChange()
  }
}

function getCheckBoxesWithoutHeaderBox() {
  let table = document.getElementById("dataTable");
  let checkBoxes: HTMLInputElement[] = []
  if (table) {
    let allInputs = table.getElementsByTagName('input')
    for (let index = 0; index < allInputs.length; index++) {
      const input = allInputs[index] as HTMLInputElement
      if (input.type.toLowerCase() == 'checkbox' && input.id != 'checkAll')
        checkBoxes.push(input)
    }
  }
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

async function clearResultTable() {
  let backButton = document.getElementById('backButton') as HTMLButtonElement
  let pageLabel = document.getElementById('pageLabel') as HTMLLabelElement
  let forwardButton = document.getElementById('forwardButton') as HTMLButtonElement
  backButton.disabled = true
  forwardButton.disabled = true
  pageLabel.innerText = "0/0"
  await populateDataTable([])
}

async function buildResultTable(cbqlQuery, page = 1) {
  let backButton = document.getElementById('backButton') as HTMLButtonElement
  let pageLabel = document.getElementById('pageLabel') as HTMLLabelElement
  let forwardButton = document.getElementById('forwardButton') as HTMLButtonElement

  let queryReturn = await getCodeBeamerCbqlResult(cbqlQuery, page, itemsPerPage)
  if (queryReturn.message) {
    return false
  } else {
    // query was successull
    let totalItems = queryReturn.total
    let numberOfPages = Math.ceil(totalItems / itemsPerPage)
    if (numberOfPages == 0) page = 0

    if (page <= 1) {
      backButton.disabled = true
    } else {
      backButton.disabled = false
      backButton.onclick = getSwitchPageButtonOnClick(cbqlQuery, page - 1)
    }
    if (page >= numberOfPages) {
      forwardButton.disabled = true
    } else {
      forwardButton.disabled = false
      forwardButton.onclick = getSwitchPageButtonOnClick(cbqlQuery, page + 1)
    }
    pageLabel.innerText = `${page}/${numberOfPages}`

    await populateDataTable(queryReturn.items)
    updateImportCountOnImportButton()
    return true
  }
}

function getSwitchPageButtonOnClick(query, page) {
  return async () => {
    await buildResultTable(query, page)
  }
}

async function cbqlQueryOnChange() {
  let cbqlQueryElement = document.getElementById('cbqlQuery') as HTMLInputElement
  let cbqlQuery = cbqlQueryElement.value
  store.saveLocalSettings({ [LocalSetting.CBQL_STRING]: cbqlQuery })

  // if not query is set
  if (!cbqlQuery) {
    cbqlQueryElement.className = "miro-input miro-input--primary miro-input--small"
    await clearResultTable()
  } else { // query is set

    let tableBuildup = await buildResultTable(cbqlQuery)
    // if there was an error, mark box red
    if (!tableBuildup) {
      cbqlQueryElement.className = "miro-input miro-input--primary miro-input--small miro-input--invalid"
      await clearResultTable()
    } else {
      cbqlQueryElement.className = "miro-input miro-input--primary miro-input--small miro-input--success"
    }
  }
}

async function trackersSelectionOnChange() {
  let selectedTrackerElement = document.getElementById('selectedTracker') as HTMLSelectElement
  let selectedTracker = selectedTrackerElement.value
  if (selectedTracker) {
    store.saveLocalSettings({ [LocalSetting.SELECTED_TRACKER]: selectedTracker })
    let tableBuildup = await buildResultTable(`tracker.id IN (${selectedTracker})`)
    if (!tableBuildup) clearResultTable()
  }
}

function selectAllOnChange() {
  let checkAllBox = document.getElementById('checkAll') as HTMLInputElement
  if (checkAllBox) {
    getCheckBoxesWithoutHeaderBox().forEach(item => item.checked = checkAllBox.checked)
    updateImportCountOnImportButton()
  }
}

async function populateDataTable(data) {
  let pickedAttributeData = data.map(({ id, name, tracker }) => ({ Tracker: tracker.name, ID: id, Name: name }))
  let table = document.getElementById("dataTable");
  if (table)
    table.innerHTML = ''
  if (data.length > 0) {
    await generateTableContent(table, pickedAttributeData);
    generateTableHead(table, pickedAttributeData);
  }
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
  let importButtonText = document.getElementById('importButtonText') as HTMLSpanElement
  let importButton = document.getElementById('importButton') as HTMLButtonElement
  let checkedItemCount = getCheckedItems().length
  if (importButtonText && importButton) {
    importButtonText.innerText = `Import Selected (${checkedItemCount})`
    importButton.disabled = checkedItemCount == 0
  }
}