import { StandardItemProperty, BoardSetting, LocalSetting, ImportConfiguration, SubqueryLinkMethod, FilterCriteria, CodeBeamerItem, CodeBeamerTrackerSchemaField } from "../../entities";
import { MAX_ITEMS_PER_IMPORT, DEFAULT_ITEMS_PER_PAGE, DEFAULT_RESULT_PAGE, MAX_ITEMS_PER_SYNCH, CRITERIA_CHIP_ID_PREFIX } from "../../constants";
import CodeBeamerService from "../../services/codebeamer";
import MiroService from "../../services/miro";
import Store from "../../services/store";

const importedImage = '/img/checked-box.svg'

let currentlyDisplayedItems: number = 0;
let currentResultsPage: number = 1;
let currentlyLoadedTrackerSchema: CodeBeamerTrackerSchemaField[] = [];

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
  let addFilterCriteriaButton = document.getElementById('add-filter') as HTMLButtonElement;
  let filterValueInput = document.getElementById('filter-value') as HTMLButtonElement;
  let toggleSubQueryButton = document.getElementById('query-chaining-method-toggle') as HTMLButtonElement;
  let wipeFilterButton = document.getElementById('wipe-filter') as HTMLSpanElement;

  let cachedAdvancedSearchEnabled = Store.getInstance().getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED)

  if (cbqlQuery) {
    cbqlQuery.onchange = cbqlQueryOnChange
  }

  if(secondaryFilterCriteria) {
    secondaryFilterCriteria.onchange = updateQuery
  }

  if(lazyLoadButton) {
    lazyLoadButton.onclick = loadAndAppendNextResultPage;
  }

  if(addFilterCriteriaButton) {
    let trackerSelected = Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER);
    if(trackerSelected) {
      enableFilterControls();
    }
    addFilterCriteriaButton.onclick = addFilterCriteriaChip;
  }

  if(filterValueInput) {
    filterValueInput.oninput = toggleAddFilterDisabled;
  }

  if(toggleSubQueryButton) {
    toggleSubQueryButton.onclick = toggleSubQueryChainingMethod;
  }

  if(wipeFilterButton) {
    wipeFilterButton.onclick = resetFilterCriteria;
  }
  
  buildImportConfiguration();
  buildFilterChipsFromStorage();

  if(importAllButton){
    if(!Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER) || 
      (!Store.getInstance().getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED)
       && Store.getInstance().getLocalSetting(LocalSetting.CBQL_STRING)
      )) {
        importAllButton.disabled = true;
      }
      importAllButton.onclick = () => importAllQueriedItems();
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
      synchButtonText.innerText = `Sync (${(await MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds()).length})`
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
  clearResultTable();

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
    switchSearchButton.innerText = advancedSearch ? "Query assistant" : "CBQL Input"
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
    displayLoadingScreen(itemsToImport.length);
    miro.showNotification(`Importing ${itemsToImport.length} items from codebeamer...`);
    getAndSyncItemsWithCodeBeamer(itemsToImport)
    .then(() => {
      miro.showNotification(`Successfully imported ${itemsToImport.length} items`)
      miro.board.ui.closeModal()
    })
    .catch(err => {
      miro.showErrorNotification(err)
      removeLoadingScreen();
    })
  }
}

function synchItems() {
  return MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds()
  .then(itemsToSynch => {
    if (itemsToSynch.length > 0){
      miro.showNotification(`Updating items...`);
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

/**
 * Clears the query-results table by populating it with an empty array.
 * Resets the {@link currentlyDisplayedItems} and {@link currentResultsPage} values.
 * Disables the lazy-load button.
 */
async function clearResultTable() {
  populateDataTable([]);
  currentlyDisplayedItems = 0;
  currentResultsPage = 1;
  (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = true;
  (document.getElementById('end-of-content') as HTMLSpanElement).hidden = true;
}

/**
 * Creates a table containing displaying the items resulting from the query and allowing to select them for import.
 * @param cbqlQuery Query to fetch items with.
 * @param page Query result page to load
 */
async function buildResultTable(cbqlQuery, page = 1) {
  let queryReturn = await CodeBeamerService.getInstance().getCodeBeamerCbqlResult(cbqlQuery, page, DEFAULT_ITEMS_PER_PAGE);
  if (queryReturn.message) {
    (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = true;
    miro.showNotification(`Invalid query: ${queryReturn.message}`);
    return false;
  } else {
    // query was successull
    let totalItems = queryReturn.total
    //enables lazy loading when there are more items to load
    if(totalItems > DEFAULT_ITEMS_PER_PAGE) {
      (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = false;
    } else {
      (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = true;
    }

    populateDataTable(queryReturn.items);
    updateImportCountOnImportButton();
    currentlyDisplayedItems += queryReturn.items.length;

    if(currentlyDisplayedItems >= totalItems) {
      (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = true;
    }
    
    let totalItemsDisplay = document.getElementById('total-items')
    if(totalItemsDisplay) totalItemsDisplay.textContent = `(${totalItems})`;

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

    let tableBuildup = await buildResultTable(cbqlQuery);
    // if there was an error, mark box red
    if (!tableBuildup) {
      cbqlQueryElement.className = "miro-input miro-input--primary miro-input--small miro-input--invalid";
      await clearResultTable();
    } else {
      let importAllButton = document.getElementById('importAllButton') as HTMLButtonElement;
      if(importAllButton) importAllButton.disabled = false;

      if(currentlyDisplayedItems == 0) {
        cbqlQueryElement.className = "miro-input miro-input--primary miro-input--small miro-input--warning";
        miro.showNotification("No results found for that query.");
      } else {
        cbqlQueryElement.className = "miro-input miro-input--primary miro-input--small miro-input--success";
      }
    }
  }
}

async function trackersSelectionOnChange() {
  let selectedTrackerElement = document.getElementById('selectedTracker') as HTMLSelectElement;
  let selectedTracker = selectedTrackerElement.value;
  resetTrackerSchema();
  resetFilterCriteria();
  if (selectedTracker) {
    Store.getInstance().saveLocalSettings({ [LocalSetting.SELECTED_TRACKER]: selectedTracker });
    let importAllButton = document.getElementById('importAllButton') as HTMLButtonElement;
    if(importAllButton) importAllButton.disabled = false;

    updateQuery();
    loadFilterTypes();
    enableFilterControls();
  }
}

/**
 * Function to run when updating the secondary filter criteria.
 * Will construct the query and trigger updating the result-table.
 */
async function updateQuery() {
  hideDataTableAndShowLoadingSpinner();
  const selectedTracker = getSelectedTracker();
  const subQuery = getFilterQuerySubstring();
  const queryString = `tracker.id IN (${selectedTracker})${subQuery}`;
  executeQueryAndBuildResultTable(queryString);
  hideLoadingSpinnerAndShowDataTable();
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
 * Constructs the CBQL query substring for the selected filter criteria
 * @returns CBQL Query substring like "AND ... = ..." if any criteria was selected.
 */
function getFilterQuerySubstring(): string {
  const store = Store.getInstance();

  const filterCriteria = store.getLocalSetting(LocalSetting.FILTER_CRITERIA);
  if(!filterCriteria || !filterCriteria.length) return '';

  const chainingMethod = store.getLocalSetting(LocalSetting.SUBQUERY_LINK_METHOD) ?? SubqueryLinkMethod.AND;

  let index = 0;
  let query = ' AND (';
  for(let criteria of filterCriteria) {
    const type = criteria.fieldName;
    const value = criteria.value;
  
    if(!value || !type) continue;

    const trackerId = store.getLocalSetting(LocalSetting.SELECTED_TRACKER);
    const codeBeamerType = CodeBeamerService.getQueryEntityNameForCriteria(type, trackerId);

    query += `${index++ == 0 ? '' : (' ' + chainingMethod + ' ')}${codeBeamerType} = '${value}'`;
  }
  query += ')';
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

function populateDataTable(data: CodeBeamerItem[]) {
  data = data.filter(item => {
    if(item.categories?.length) {
      if(item.categories.find(c => c.name == 'Folder' || c.name == 'Information')) return false;
    }
    return true;
  });

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
    row.classList.add('fade-in');
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
 * Imports all (up to {@link  MAX_ITEMS_PER_IMPORT)} items in the current query. At your own discretion, since that takes time.
 * Works for both query methods (assisted/simple and advanced/cbql input).
 */
async function importAllQueriedItems() {
  let query: string = '';
  const isAdvancedSearch = Store.getInstance().getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED);

  if(isAdvancedSearch) {
    query = Store.getInstance().getLocalSetting(LocalSetting.CBQL_STRING);
  } else {
    query = buildSimpleSearchQueryString();
  }

  //Make sure already imported items aren't reimported
  let alreadySynchedItemIds: string[] = [];
  try {
    alreadySynchedItemIds = await MiroService.getInstance().getAllSynchedCodeBeamerCardItemIds();
  } catch (error) {
    console.warn("Couldn't get ids of already synched items. Might lead to duplicate imports");
  }
  query = `${query}${alreadySynchedItemIds.length ? ` AND item.id NOT IN (${alreadySynchedItemIds.join(',')})` : ''}`

  let queryReturn = await CodeBeamerService.getInstance().getCodeBeamerCbqlResult(query, DEFAULT_RESULT_PAGE, MAX_ITEMS_PER_IMPORT);
  
  if(queryReturn.message) {
    miro.showErrorNotification(`Failed importing items: ${queryReturn.message}`);
    return;
  } else {
    // query was successfull
    let totalItems = queryReturn.total;
    
    if(window.confirm(`Import ${totalItems} items from codeBeamer? ${ totalItems >= 20 ? 'This could take a while.' : '' }`)) {
      displayLoadingScreen();
      await syncItemsWithCodeBeamer(queryReturn.items);
      miro.board.ui.closeModal();
    } else {
      removeLoadingScreen();
    }
  }
}

/**
 * Shows the loading screen
 * Also removes the content div's fade-in class so it can fade in again.
 * @param totalElementsToLoad If specified, the loading screen will prepare a progress bar with this value. Use {@link updateLoadingProgress} to update the bar.
 */
function displayLoadingScreen(totalElementsToLoad?: number) {
  let loadingScreen = document.getElementById('loadingScreen');
  if(loadingScreen) {
    if(totalElementsToLoad) {
      updateLoadingProgress(0, totalElementsToLoad);
    }
    loadingScreen.hidden = false;
  }

  let content = document.getElementById('content');
  if(content) {
    content.classList.remove('fade-in');
  }
}

/**
 * Will update the progress bar on the loading screen to visualize the arguments.
 * Will automatically start displaying the progress bar and remove the indeterminate spinner when called the first time.
 * @param loadedElements Amount of already loaded elements
 * @param totalElements Total amount of elements to load
 * @param resumeIndeterminateState Set to true to hide the progressBar and show the indeterminate loading spinner. Defaults to false.
 */
function updateLoadingProgress(loadedElements: number, totalElements: number, resumeIndeterminateState: boolean = false) {
  let loadingScreen = document.getElementById('loadingScreen');
  if(loadingScreen && loadingScreen.hidden) return;

  let progressBarContainer = document.getElementById('determinateLoading') as HTMLDivElement;
  if(!progressBarContainer) return;
  let progressBar = progressBarContainer.querySelector('#loadingProgressBar') as HTMLDivElement;
  if(!progressBar) return;
  let indeterminateSpinner = document.getElementById('indeterminateLoading') as HTMLDivElement;

  if(resumeIndeterminateState) {
    progressBarContainer.hidden = true;
    if(indeterminateSpinner) indeterminateSpinner.hidden = false;
    return;
  }

  if(progressBarContainer.hidden == true) {
    progressBarContainer.hidden = false;
    if(indeterminateSpinner) indeterminateSpinner.hidden = true;
  }

  let completionPercentage = Math.floor((loadedElements/totalElements) * 100);
  progressBar.style.width = `${completionPercentage}%`;
  if(progressBar['ariaValueNow']) {
    progressBar['ariaValueNow'] = completionPercentage.toString();
  }
  progressBar.innerText = `${loadedElements} / ${totalElements}`;
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
  let loadingSpinner = document.getElementById('loadingSpinner');
  if(loadingSpinner) loadingSpinner.hidden = false;
}

/**
 * Shows the dataTable and hides the div containing the loading spinner.
 */
function hideLoadingSpinnerAndShowDataTable() {
  let dataTable = document.getElementById('dataTable');
  if(dataTable) dataTable.hidden = false;
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
async function syncItemsWithCodeBeamer(cbItems: CodeBeamerItem[]): Promise<void> {
  let count = 0;

  for (let cbItem of cbItems) {
    if(cbItem.categories?.length) {
      if(cbItem.categories.find(c => c.name == 'Folder' || c.name == 'Information')){
        miro.showNotification("Skipping Folder / Information Item " + cbItem.name);
        continue;
      }
    }
    await MiroService.getInstance().createOrUpdateCbItem(cbItem);
    updateLoadingProgress(++count, cbItems.length);
  }

  miro.showNotification("Creating relations between items...");
  count = 0;
  updateLoadingProgress(0, 0, true);
  for (let cbItem of cbItems) {
    if(cbItem.categories?.length) {
      if(cbItem.categories.find(c => c.name == 'Folder' || c.name == 'Information')){
        continue;
      }
    }
    await createUpdateOrDeleteRelationLines(cbItem);
    updateLoadingProgress(++count, cbItems.length);
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
 * Loads the next results page for the current search criteria (or advanced query string) and calls {@link appendResultsToDataTable}.
 */
async function loadAndAppendNextResultPage() {
  (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = true;
  const isAdvancedSearch = Store.getInstance().getLocalSetting(LocalSetting.ADVANCED_SEARCH_ENABLED);
  let queryString = '';
  if(isAdvancedSearch) {
    const storedCBQString = Store.getInstance().getLocalSetting(LocalSetting.CBQL_STRING);
    if(!storedCBQString) {
      miro.showErrorNotification("Something went wrong trying to execute the query!");
      (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = false;
      return;
    }
    queryString = storedCBQString;
  } else {
    queryString = buildSimpleSearchQueryString();
  }

  let queryResponse = await CodeBeamerService.getInstance().getCodeBeamerCbqlResult(queryString, currentResultsPage++, DEFAULT_ITEMS_PER_PAGE);
  const totalItems = queryResponse.total;
  const items: any[] = queryResponse.items;

  appendResultsToDataTable(items);
  currentlyDisplayedItems += items.length;

  if(currentlyDisplayedItems >= totalItems) {
    (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = true;
    (document.getElementById('end-of-content') as HTMLSpanElement).hidden = false;
  } else {
    (document.getElementById('lazy-load-button') as HTMLButtonElement).hidden = false;
  }
}

/**
 * Builds the current query string based on the filter criteria in the "simple search".
 * @returns CBQL query string matching the selected filter criteria
 */
function buildSimpleSearchQueryString(): string {
  const selectedTracker = getSelectedTracker();
  const subQuery = getFilterQuerySubstring();
  return `tracker.id IN (${selectedTracker})${subQuery}`;
}

/**
 * Builds the HTML for the standard import configuration settings, based on the values of the {@link StandardItemProperty} enum.
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

    let importConfiguration: ImportConfiguration;
    try {
      importConfiguration = Store.getInstance().getBoardSetting(BoardSetting.IMPORT_CONFIGURATION);
      input.checked = importConfiguration.standard[property];
    } catch (error) {
      input.checked = false;
    }

    input.value = property;
    input.onchange = saveStandardImportConfigurationValue;

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
 * Persists the selected property-to-import in the board setting's import configuration object.
 * Only updates the selected property's value.
 */
function saveStandardImportConfigurationValue(event: any) {
  if(!event.target || !(event.target instanceof HTMLInputElement)) {
    console.error("This event handler can't be used for this element: ", event.target);
    return;
  }
  let target = event.target as HTMLInputElement;

  let importConfiguration: ImportConfiguration;
  try {
    importConfiguration = Store.getInstance().getBoardSetting(BoardSetting.IMPORT_CONFIGURATION);
  } catch (error) {
    importConfiguration = createDefaultImportConfigurationObject();
  }
  if(!importConfiguration){
    importConfiguration = createDefaultImportConfigurationObject();
  }

  importConfiguration.standard[target.value] = target.checked;
  Store.getInstance().saveBoardSettings({ [BoardSetting.IMPORT_CONFIGURATION]: importConfiguration });
}

/**
 * Creates the agreed-upon default import configuration.
 * @returns Empty, ImportConfiguration-adhering object.
 */
function createDefaultImportConfigurationObject(): ImportConfiguration {
  return {
    standard: {},
    trackerSpecific: [],
  };
}

/**
 * Fills the filter-type select's options with the standard criteria and loads tracker-specific types.
 * The latter are loaded asynchronously and added with {@link addTrackerSchemaSelectOptions} when the data is fetched.
 */
function loadFilterTypes() {
  const select = document.getElementById('filter-type') as HTMLSelectElement;
  if(!select) return;

  const criteriaTypes = Object.keys(FilterCriteria).map(e => {
    return FilterCriteria[e];
  });

  for(let i = 0; i < criteriaTypes.length; i++) {
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = criteriaTypes[i];
    option.text = criteriaTypes[i]
    option.selected = i == 0;

    select.appendChild(option);
  }

  if(currentlyLoadedTrackerSchema.length) {
    addTrackerSchemaSelectOptions(select, currentlyLoadedTrackerSchema);
  } else {
    const trackerId = Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER);
    //these can be added once fetched, while the standard criteria are already displayed and available
    CodeBeamerService.getInstance().getTrackerSchema(trackerId).then(schema => {
      currentlyLoadedTrackerSchema = schema;
      addTrackerSchemaSelectOptions(select, schema);
    });
  }
}

/**
 * Generates a filter chip using {@link createFilterChip} and saves its data in the local storage, then runs {@link updateQuery}
 */
function addFilterCriteriaChip() {
  const container = document.getElementById('filter-criteria') as HTMLDivElement;
  const filterTypeSelect = document.getElementById('filter-type') as HTMLSelectElement;
  const filterValueInput = document.getElementById('filter-value') as HTMLInputElement;

  if(!container || !filterTypeSelect || !filterValueInput) return;
  
  const selectedTypeName = filterTypeSelect.options[filterTypeSelect.selectedIndex].innerText;
  const selectedTypeValue = filterTypeSelect.value;
  const filterValue = filterValueInput.value;
  
  //save/overwrite filter in local settings
  let filterCriteria = Store.getInstance().getLocalSetting(LocalSetting.FILTER_CRITERIA);
  if(!filterCriteria || !filterCriteria.length) {
    filterCriteria = [];
    showWipeFilterButton();
  }
  let insertIndex = filterCriteria.length;
  createFilterChip(container, selectedTypeName, filterValue, insertIndex);

  //TODO interface or smth like that to make it less magic
  //! doesn't allow specifying two teams or sprints etc.
  filterCriteria.push({id: insertIndex, slug: selectedTypeName, fieldName: selectedTypeValue, value: filterValue });
  Store.getInstance().saveLocalSettings({ [LocalSetting.FILTER_CRITERIA]: filterCriteria });

  filterValueInput.value = '';
  updateQuery();
}

/**
 * Creates a filterchip for the given parameters
 * @param container Div to append the chip to
 * @param typeName TypeName to display in the chip 
 * @param typeValue TypeName to store for the cb query
 * @param filterValue Value to query the type for
 */
function createFilterChip(container: HTMLDivElement, typeName: string, filterValue: string, id: number): void {
  const chip = document.createElement('div') as HTMLDivElement;
  chip.classList.add('criteria', 'badge' ,'rounded-pill' ,'bg-light', 'text-muted', 'fade-in');
  chip.innerText = `${typeName}: ${filterValue}`;

  const closeButton = document.createElement('div') as HTMLDivElement;
  closeButton.classList.add('filter-removal', 'm-1');
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Close</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg>';
  //for easy removal later
  closeButton.id = `${CRITERIA_CHIP_ID_PREFIX}${id}`;
  closeButton.onclick = removeFilterCriteria;

  chip.appendChild(closeButton);
  container.appendChild(chip);
}

/**
 * Creates the filter chips according to the loclly stored filter criteria.
 */
function buildFilterChipsFromStorage() {
  const trackerSelected = Store.getInstance().getLocalSetting(LocalSetting.SELECTED_TRACKER);
  let filterCriteria = Store.getInstance().getLocalSetting(LocalSetting.FILTER_CRITERIA);
  if(!trackerSelected) {
    resetFilterCriteria();
    return;
  }
  if(!filterCriteria || !filterCriteria.length) return;
  const container = document.getElementById('filter-criteria') as HTMLDivElement;
  for(let criteria of filterCriteria) {
    createFilterChip(container, criteria.slug, criteria.value, criteria.id);
  }
  showWipeFilterButton();
}

/**
 * Removes the target filter criteria chip and calls {@link updateQuery}
 * @param event Event containing the target element
 */
 function removeFilterCriteria(event) {
  if(!event.target) return;
  const criteriaChip = event.target.closest('.criteria') as HTMLDivElement;
  const closeButton = event.target.closest('div') as HTMLDivElement;
  const criteriaId = closeButton.id.split('-')[1];
  //remove criteria from local storage
  let filterCriteria: any[] = Store.getInstance().getLocalSetting(LocalSetting.FILTER_CRITERIA);
  if(filterCriteria.length == 1){
    filterCriteria = [];
    hideWipeFilterButton();
  } else {
    const criteria = filterCriteria.find(c => c.id == criteriaId);
    const index = filterCriteria.indexOf(criteria);
    filterCriteria.splice(index, 1);
  }
  console.log("FC post: ", filterCriteria);

  Store.getInstance().saveLocalSettings({[LocalSetting.FILTER_CRITERIA]: filterCriteria });

  criteriaChip.remove();
  updateQuery();
}

/**
 * Adds the given Tracker Schema entries as options in the given select element.
 * @param select The select element to add options to
 * @param schema Tracker schema
 */
function addTrackerSchemaSelectOptions(select: HTMLSelectElement, schema: CodeBeamerTrackerSchemaField[]) {
  const option = document.createElement('option') as HTMLOptionElement;
  option.disabled = true;
  option.text = '----- Tracker-Fields -----';

  select.appendChild(option);

  for(let i = 0; i < schema.length; i++) {
    const { name, legacyRestName, trackerItemField } = schema[i];

    const option = document.createElement('option') as HTMLOptionElement;
    option.value = trackerItemField ?? legacyRestName;
    option.text = name;
    //to differentiate from standard criteria types
    option.id = 'custom-type-' + i;

    select.appendChild(option);
  }
}

/**
 * Toggles the stored subQueryLinkMethod between OR and AND, then calls {@link updateQuery}.
 * @param event Generic event containing the HTML target element
 */
function toggleSubQueryChainingMethod(event) {
  let span = event.target as HTMLSpanElement;
  if(!span) return; 
  let current = span.innerText as SubqueryLinkMethod;

  if(current == SubqueryLinkMethod.AND) {
    current = SubqueryLinkMethod.OR;
  } else {
    current = SubqueryLinkMethod.AND;
  }

  Store.getInstance().saveLocalSettings({ [LocalSetting.SUBQUERY_LINK_METHOD]: current });
  span.innerText = current;

  updateQuery();
}

/**
 * Clears the {@link currentlyLoadedTrackerSchema} array
 */
function resetTrackerSchema() {
  currentlyLoadedTrackerSchema = [];
  let filterTypeSelect = document.getElementById('filter-type');
  if(filterTypeSelect) {
    filterTypeSelect.querySelectorAll('option').forEach($el => {
      if($el.value) $el.remove();
    })
  }
}

/**
 * Enables the three filter control elements type-select, value-input but not the add-button.
 * The latter is enabled dynamically when input is provided by {@link toggleAddFilterDisabled}
 */
function enableFilterControls() {
  let select = document.getElementById('filter-type') as HTMLSelectElement;
  let valueInput = document.getElementById('filter-value') as HTMLButtonElement;
  if(select) select.disabled = false;
  if(valueInput) valueInput.disabled = false;
}

/**
 * Disables the three filter control elements type-select, value-input and add-button.
 */
function disableFilterControls() {
  let select = document.getElementById('filter-type') as HTMLSelectElement;
  let addButton = document.getElementById('add-filter') as HTMLButtonElement;
  let valueInput = document.getElementById('filter-value') as HTMLButtonElement;
  if(select) select.disabled = true;
  if(addButton) addButton.disabled = true;
  if(valueInput) valueInput.disabled = true;
}

/**
 * Eventhandler for the filter-value input element. Toggles disabled status of the add-filter button.
 * Therefore, one can't add a filter if you haven't specified a value.
 * @param event onchange event data
 */
function toggleAddFilterDisabled(event) {
  let addButton = document.getElementById('add-filter') as HTMLButtonElement;
  if(!addButton) return;
  if(event.target.value) {
    addButton.disabled = false;
  } else {
    addButton.disabled = true;
  }
}

/**
 * Resets all filter criteria, removing all chips and the wipe-button and clearing the respective storage.
 */
function resetFilterCriteria() {
  const filterCriteria = [];
  Store.getInstance().saveLocalSettings({[LocalSetting.FILTER_CRITERIA]: filterCriteria});

  const criteriaChips = document.querySelectorAll('.criteria');
  if(criteriaChips && criteriaChips.length) {
    for(let i = 0; i <criteriaChips.length; i++) {
      criteriaChips[i].remove();
    }
  }
  hideWipeFilterButton();

  updateQuery();
}

function hideWipeFilterButton() {
  const wipeBadge = document.getElementById('wipe-filter');
  if(wipeBadge) {
    wipeBadge.hidden = true;
  }
}

function showWipeFilterButton() {
  const wipeBadge = document.getElementById('wipe-filter');
  if(wipeBadge) {
    wipeBadge.hidden = false;
  }
}

function hideQueryChainingMethodToggleButton() {
  const button = document.getElementById('query-chaining-method-toggle');
  if(button) {
    button.hidden = true;
  }
}

function showQueryChainingMethodToggleButton() {
  const button = document.getElementById('query-chaining-method-toggle');
  if(button) {
    button.hidden = false;
  }
}