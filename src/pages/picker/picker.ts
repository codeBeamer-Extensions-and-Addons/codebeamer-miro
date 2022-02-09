import { StandardItemProperty } from "../../entities";
import { MAX_ITEMS_PER_IMPORT, DEFAULT_ITEMS_PER_PAGE, DEFAULT_RESULT_PAGE, MAX_ITEMS_PER_SYNCH } from "../../constants/cb-import-defaults";
import { BoardSetting } from "../../entities";
import { LocalSetting } from "../../entities";
import CodeBeamerService from "../../services/codebeamer";
import MiroService from "../../services/miro";
import Store from "../../services/store";

const importedImage = '/img/checked-box.svg'

let currentResultItems: any[] = [];
let currentResultsPage = 1;

buildImportConfiguration();

miro.onReady(async () => {
  Store.create(miro.getClientId(), (await miro.board.info.get()).id);
})

setTimeout(() => {
  //calling this with a delay since above miro.onReady creates the Store instance asynchronously
  //while following method would do it synchronously if no Store exists yet.
  //(to allow for cypress testing, you can't just put it after the Store.create() above)
  initializeHandlers();
}, 500);

/**
 * Initializes event handlers for the page's elements and executes those only done once in the beginning.
 */
export async function initializeHandlers() {
  removeLoadingScreen();

  let trackersSelection = document.getElementById('selectedTracker') as HTMLSelectElement
  let importButton = document.getElementById('importButton')
  let importButtonText = document.getElementById('importButtonText')
  let importAllButton = document.getElementById('importAllButton') as HTMLButtonElement
  let synchButton = document.getElementById('synchButton')
  let synchButtonText = document.getElementById('synchButtonText')
  let cbqlQuery = document.getElementById('cbqlQuery') as HTMLInputElement
  let secondaryFilterCriteria = document.getElementById('filter-criteria') as HTMLInputElement;
  let lazyLoadButton = document.getElementById('lazy-load-button') as HTMLButtonElement;
  let configurationSaveButton = document.getElementById('saveConfiguration') as HTMLButtonElement;

  let cachedAdvancedSearchEnabled = Store.getInstance().getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED)

  if (cbqlQuery) {
    cbqlQuery.onchange = cbqlQueryOnChange
  }

  if(secondaryFilterCriteria) {
    secondaryFilterCriteria.onchange = updateFilter
  }

  if(lazyLoadButton) {
    lazyLoadButton.onclick = loadAndAppendNextResultPage;
  }

  if(configurationSaveButton) {
    configurationSaveButton.onclick = saveImportConfiguration;
  }

  if(importAllButton){
    if(!Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER)) {
        importAllButton.disabled = true;
      }
      importAllButton.onclick = () => importAllItemsForTracker();
    }
    
    if (trackersSelection) {
    // build tracker options
    let availableTrackers: any[];
    try {
      availableTrackers = await CodeBeamerService.getInstance().getCodeBeamerProjectTrackers(Store.getInstance().getBoardSetting(BoardSetting.PROJECT_ID));
    } catch (error) {
      miro.showErrorNotification(error);
      miro.board.ui.openModal('picker.html');
      return;
    }
    if(!availableTrackers.length){
      var nullOption = document.createElement("option");
      nullOption.value = "";
      nullOption.innerHTML = `No Trackers found for the selected Project`;
      trackersSelection.appendChild(nullOption);
    }
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
    try {
      synchButtonText.innerText = `Update Synched Items (${(await MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds()).length})`
    } catch (err) {
      if(err.message.includes("reading 'widgets'")) {
        console.warn("Miro board undefined. No problem if you're in the test environment though.")
      } else {
        throw err;
      }
    }
  }
}

function getSwitchSearchButtonOnClick(switchToAdvanced: boolean) {
  return () => loadSearchAndResults(switchToAdvanced)
}

function loadSearchAndResults(advancedSearch: boolean) {
  Store.getInstance().saveLocalSettings({ [LocalSetting.ADVANCED_SEARCH_ENABLED]: advancedSearch })

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
    let cachedCbqlString = Store.getInstance().getLocalSetting(LocalSetting.CBQL_STRING)
    if (cachedCbqlString) {
      let cbqlQuery = document.getElementById('cbqlQuery') as HTMLInputElement
      cbqlQuery.value = cachedCbqlString
    }
    cbqlQueryOnChange()
  } else { // init simple search
    let cachedSelectedTracker = Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER)
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
  if (itemsToImport.length > 0){
    miro.showNotification(`Importing ${itemsToImport.length} items from codebeamer...`);
    hideDataTableAndShowLoadingSpinner();
    getAndSyncItemsWithCodeBeamer(itemsToImport)
    .then(() => {
      miro.showNotification(`Successfully imported ${itemsToImport.length} items`)
      miro.board.ui.closeModal()
    })
    .catch(err => {
      miro.showErrorNotification(err)
      hideLoadingSpinnerAndShowDataTable();
    })
  }
}

function synchItems() {
  return MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds()
  .then(itemsToSynch => {
    if (itemsToSynch.length > 0){
      miro.showNotification(`Updating items...`);
      hideDataTableAndShowLoadingSpinner();
        getAndSyncItemsWithCodeBeamer(itemsToSynch)
          .then((updated) => {
            let suffix;
            try {
              suffix = itemsToSynch.length > updated ? ` from ${Store.getInstance().getBoardSetting(BoardSetting.CB_ADDRESS)}` : "";
            } catch (error) {
              miro.showErrorNotification(error);
              miro.board.ui.openModal('picker.html');
              return;
            }
            miro.showNotification(`Successfully updated ${updated} items ${suffix}`)
            miro.board.ui.closeModal();
          })
          .catch(err => {
            miro.showErrorNotification(err)
            hideLoadingSpinnerAndShowDataTable();
          })
        }
    })
}

async function clearResultTable() {
  populateDataTable([]);
  currentResultItems = [];
  currentResultsPage = 1;
  (document.getElementById('lazy-load-button') as HTMLButtonElement).disabled = true;
}

/**
 * Creates a table containing displaying the items resulting from the query and allowing to select them for import.
 * @param cbqlQuery Query to fetch items with.
 * @param page Query result page to load
 */
async function buildResultTable(cbqlQuery, page = 1) {
  let queryReturn = await CodeBeamerService.getInstance().getCodeBeamerCbqlResult(cbqlQuery, page, DEFAULT_ITEMS_PER_PAGE)
  if (queryReturn.message) {
    return false;
  } else {
    // query was successull
    let totalItems = queryReturn.total
    if(totalItems > DEFAULT_ITEMS_PER_PAGE) {
      (document.getElementById('lazy-load-button') as HTMLButtonElement).disabled = false;
    }

    populateDataTable(queryReturn.items)
    updateImportCountOnImportButton()
    currentResultItems.push(queryReturn.items);
    return true;
  }
}

async function cbqlQueryOnChange() {
  let cbqlQueryElement = document.getElementById('cbqlQuery') as HTMLInputElement
  let cbqlQuery = cbqlQueryElement.value
  Store.getInstance().saveLocalSettings({ [LocalSetting.CBQL_STRING]: cbqlQuery })

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
    Store.getInstance().saveLocalSettings({ [LocalSetting.SELECTED_TRACKER]: selectedTracker })
    let importAllButton = document.getElementById('importAllButton') as HTMLButtonElement;
    if(importAllButton) importAllButton.disabled = false;

    let queryString = `tracker.id IN (${selectedTracker})`;
    executeQueryAndBuildResultTable(queryString);
  }
}

/**
 * Function to run when updating the secondary filter criteria.
 * Will construct the query and trigger updating the resulttable.
 */
async function updateFilter() {
  const selectedTracker = getSelectedTracker();
  const subQuery = getFilterQuerySubstring();
  const queryString = `tracker.id IN (${selectedTracker})${subQuery}`;
  executeQueryAndBuildResultTable(queryString);
}

function getSelectedTracker(): string {
  const selectedTracker = Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER);
  if(!selectedTracker) {
    miro.showErrorNotification("Please select a Tracker.");
    throw new Error("No tracker selected");
  }
  return selectedTracker;
}

/**
 * Constructs the CBQL query substring for the filter criteria
 * @returns CBQL Query substring like "AND ... = ..." if a criteria was selected.
 */
function getFilterQuerySubstring(): string {
  let filterType = (document.getElementById('secondary-criteria-type') as HTMLSelectElement)?.value;
  let filterCriteria = (document.getElementById('filter-criteria') as HTMLInputElement)?.value;
  let queryCriteria = '';
  let query = '';

  if(filterCriteria) {
    queryCriteria = CodeBeamerService.getQueryEntityNameForCriteria(filterType);
    query = ` AND ${queryCriteria} = '${filterCriteria}'`;
  }

  return query;
}

/**
 * Triggers updating the result table with given query
 * @param query CBQL query to run
 */
async function executeQueryAndBuildResultTable(query: string) {
  let tableBuildup = await buildResultTable(query);
  if (!tableBuildup) clearResultTable();
}

/**
 * Routine to select items in the result table for import.
 * @deprecated Respective HTML element has been removed
 */
function selectAllOnChange() {
  let checkAllBox = document.getElementById('checkAll') as HTMLInputElement
  if (checkAllBox) {
    getCheckBoxesWithoutHeaderBox().forEach(item => item.checked = checkAllBox.checked)
    updateImportCountOnImportButton()
  }
}

function populateDataTable(data) {
  let pickedAttributeData = data.map(({ id, name }) => ({ ID: id, Name: name }))
  let table = document.getElementById("dataTable") as HTMLTableElement;
  if (table){
    table.innerHTML = '';
    table.classList.remove('fade-in');
    if (data.length > 0) {
      generateTableHead(table, pickedAttributeData);
      generateTableContent(table.createTBody(), pickedAttributeData);
      table?.classList.add('fade-in');
    }
  }
}

/**
 * Appends given items to the results-table.
 * @param items Array of codeBeamer items to append rows for.
 */
function appendResultsToDataTable(items) {
  let leanItems = items.map(({id, name}) => ({ID: id, Name: name}));
  let table = document.getElementById("dataTable") as HTMLTableElement;
  if(!table) {
    miro.showErrorNotification("Something went wrong when trying to add items to the result table!");
    console.error("dataTable not found");
    return;
  }
  let tableBody = table.getElementsByTagName('tbody')[0];
  if(!tableBody) {
    tableBody = table.createTBody();
  }
  generateTableContent(tableBody, leanItems);
}

/**
 * Generates the result table's header row.
 */
function generateTableHead(table: HTMLTableElement, data: any[]) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  let th = document.createElement("th");
  th.textContent = 'Imported';
  row.appendChild(th);
  for (let key of Object.keys(data[0])) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

/**
 * Adds a row per item in the data argument into the given table.
 * The first cell will be the checkbox-cell to select the item for import.
 * Other cells are created dynamically, for each property an item has.
 * @param table HTML Table to append rows to
 * @param data Array of items to append to
 */
async function generateTableContent(tableBody: HTMLTableSectionElement, data: any[]) {
  let alreadySynchedItems: string[] = [];
  try {
    alreadySynchedItems = await MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds()
  } catch (err) {
    if(err.message.includes("reading 'widgets'")) {
      console.warn("Miro board undefined. No problem if you're in the test environment though.")
    } else {
      throw err;
    }
  }
  for (let element of data) {
    let row: HTMLTableRowElement = tableBody.insertRow();
    let cell = row.insertCell();

    // if item is already synched, dont create checkbox
    if (alreadySynchedItems.some((val) => val == element.ID)) {
      let img = document.createElement('img');
      img.src = importedImage;
      img.classList.add('imported-checkedBox');
      img.title = 'Imported';
      cell.appendChild(img);
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

/**
 * Imports all (up to MAX_ITEMS_PER_IMPORT) items in the current query. At your own discretion, since that takes time.
 * @param trackerId 
 */
async function importAllItemsForTracker() {
  let trackerId = Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER);
  document.getElementById('importAllButton')?.classList.add('miro-btn--loading');
  
  //get all items, filtering out already imported ones right in the cbq
  let alreadySynchedItemIds = await MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds();

  let queryReturn = await CodeBeamerService.getInstance().getCodeBeamerCbqlResult(`tracker.id IN (${trackerId}) AND item.id NOT IN (${alreadySynchedItemIds.join(',')})${getFilterQuerySubstring()}`, DEFAULT_RESULT_PAGE, MAX_ITEMS_PER_IMPORT);
  
  if(queryReturn.message) {
    miro.showErrorNotification(`Failed importing all items: ${queryReturn.message}`);
    document.getElementById('importAllButton')?.classList.remove('miro-btn--loading');
    return;
  } else {
    // query was successfull
    let totalItems = queryReturn.total;
    
    if(window.confirm(`Import ${totalItems} items from codeBeamer? ${ totalItems >= 20 ? 'This could take a while.' : '' }`)) {
      hideDataTableAndShowLoadingSpinner();
      await syncItemsWithCodeBeamer(queryReturn.items);
      miro.board.ui.closeModal();
    }
    document.getElementById('importAllButton')?.classList.remove('miro-btn--loading');
  }
}

/**
 * Shows the loading screen
 * Also removes the content div's fade-in class so it can fade in again.
 */
function displayLoadingScreen() {
  let loadingScreen = document.getElementById('loadingScreen');
  if(loadingScreen) {
    loadingScreen.hidden = false;
  }

  let content = document.getElementById('content');
  if(content) {
    content.classList.remove('fade-in');
  }
}

/**
 * Hides the loading screen div and lets the content div fade in.
 */
function removeLoadingScreen() {
  let loadingScreen = document.getElementById('loadingScreen');
  if(loadingScreen) {
    loadingScreen.hidden = true;
  }

  let content = document.getElementById('content');
  if(content) {
    content.classList.add('fade-in');
  }
}

/**
 * Hides the dataTable and shows the div containing the loading spinner.
 */
function hideDataTableAndShowLoadingSpinner() {
  let dataTable = document.getElementById('dataTable');
  if(dataTable) dataTable.hidden = true;
  let tableControls = document.getElementById('dataTableControls');
  if(tableControls) tableControls.hidden = true;
  let loadingSpinner = document.getElementById('loadingSpinner');
  if(loadingSpinner) loadingSpinner.hidden = false;
}

/**
 * Shows the dataTable and hides the div containing the loading spinner.
 */
function hideLoadingSpinnerAndShowDataTable() {
  let dataTable = document.getElementById('dataTable');
  if(dataTable) dataTable.hidden = false;
  let tableControls = document.getElementById('dataTableControls');
  if(tableControls) tableControls.hidden = false;
  let loadingSpinner = document.getElementById('loadingSpinner');
  if(loadingSpinner) loadingSpinner.hidden = true;
}

/**
 * Fetches detailed data for the codeBeamerItems with ids in question, then creates or updates their Miro cards.
 * @param itemIds Array of codeBeamer Item ids
 * @returns Amount of items synchronized (since it can differ from number of items in the parameter array if items have been imported from different cb instances).
 */
async function getAndSyncItemsWithCodeBeamer(itemIds: string[]): Promise<number> {
  let items = await (await CodeBeamerService
    .getInstance()
    .getCodeBeamerCbqlResult(`item.id IN (${itemIds.join(",")})`, DEFAULT_RESULT_PAGE, MAX_ITEMS_PER_SYNCH)).items;
  
  await syncItemsWithCodeBeamer(items);
  return items.length;
}

/**
 * Creates or updates Miro cards for the provided items.
 * @param cbItems Array of codeBeamer items.
 * @returns Number of items synchronized.
 */
async function syncItemsWithCodeBeamer(cbItems: []): Promise<void> {
  for (let cbItem of cbItems) {
    await MiroService.getInstance().createOrUpdateCbItem(cbItem);
  }
  for (let cbItem of cbItems) {
    await createUpdateOrDeleteRelationLines(cbItem);
  }
}

//TODO that should probably go to MiroService
async function createUpdateOrDeleteRelationLines(cbItem) {
  let relations = await CodeBeamerService.getInstance().getCodeBeamerOutgoingRelations(
    cbItem.id.toString()
  );
  const existingLines = await MiroService.getInstance().findLinesByFromCard(cbItem.card.id);

  // delete codebeamer-flagged lines which are no longer present in codebeamer that originate on any of the items synched above
  let deletionTask = Promise.all(
    existingLines.map(async (line) => {
      if (
        !relations.find(
          (relation) =>
            line.metadata[Store.getInstance().appId].id === relation.id
        )
      ) {
        await MiroService.getInstance().deleteWidget(line);
      }
    })
  );

  // add or update lines from codeBeamer
  let additionTask = Promise.all(
    relations.map(async (relation) => {
      const toCard = await MiroService.getInstance().findWidgetByTypeAndMetadataId({
        type: "CARD",
        metadata: { [Store.getInstance().appId]: { id: relation.itemRevision.id } },
      });
      if (toCard) {
        await MiroService.getInstance().createOrUpdateWidget(
          await MiroService.getInstance().convert2Line(relation, cbItem.card.id, toCard.id)
        );
      }
    })
  );

  await Promise.all([deletionTask, additionTask]);
}

/**
 * Loads the next results page for the current search criteria (or advanced query string) and appends it do the results-table.
 */
async function loadAndAppendNextResultPage() {
  const isAdvancedSearch = Store.getInstance().getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED);
  let queryString = '';
  if(isAdvancedSearch) {
    const storedCBQString = Store.getInstance().getLocalSetting(LocalSetting.CBQL_STRING);
    if(!storedCBQString) {
      miro.showErrorNotification("Something went wrong trying to execute the query!");
      return;
    }
    queryString = storedCBQString;
  } else {
    const selectedTracker = getSelectedTracker();
    const subQuery = getFilterQuerySubstring();
    queryString = `tracker.id IN (${selectedTracker})${subQuery}`;
  }

  const items: any[] = (await CodeBeamerService.getInstance().getCodeBeamerCbqlResult(queryString, currentResultsPage++, DEFAULT_ITEMS_PER_PAGE)).items;

  appendResultsToDataTable(items);
  currentResultItems.push(items);

  if(currentResultItems.length == items.length) {
    (document.getElementById('lazy-load-button') as HTMLButtonElement).disabled = true;
  }
}

/**
 * Builds the HTML for the standard import configuration settings, based on the values of the StandardItemProperty enum.
 */
function buildImportConfiguration() {
  const container = document.getElementById('standardProperties');
  if(!container) {
    console.error("Container for displaying property-import configuration options doesn't exist.")
    return;
  }

  const standardProperties = Object.keys(StandardItemProperty).map((e) => {
    return StandardItemProperty[e]
  });

  for(let property of standardProperties) {
    const div = document.createElement('div') as HTMLDivElement;
    div.classList.add('property', 'my-2');
    
    const label = document.createElement('label') as HTMLLabelElement;
    label.classList.add('checkbox');

    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'checkbox';
    input.tabIndex = 0;
    //TODO according to saved settings
    input.checked = false;
    input.disabled = property == StandardItemProperty.SUMMARY || property == StandardItemProperty.DESCRIPTION || property == StandardItemProperty.STATUS;
    input.value = property;
    input.onchange = saveImportConfiguration;

    const span = document.createElement('span') as HTMLSpanElement;
    span.classList.add('mx-2');
    span.textContent = property;

    label.append(input);
    label.append(span);
    div.append(label);
    container.append(div);
  }
}

/**
 * Persists the selected propertiy-to-import in the boardsettings.
 */
function saveImportConfiguration(event: any) {
  if(!event.target || !(event.target instanceof HTMLInputElement)) {
    console.error("This event handler can't be used for this element: ", event.target);
    return;
  }
  let target = event.target as HTMLInputElement;
  console.log(target.checked);

  let importSettings: Record<string, boolean>;

  try {
    importSettings = Store.getInstance().getBoardSetting(BoardSetting.IMPORT_CONFIGURATION);
  } catch (error) {
    importSettings = {};
  }

  console.log("Importsetting pre change: ", importSettings);
  importSettings[target.value] = target.checked;
  console.log("Importsetting post change: ", importSettings);

  Store.getInstance().savePickerSettings(importSettings);
}
