
import * as sanitizeHtml from 'sanitize-html';
import { encode }from 'html-entities';
import { LocalSetting } from '../entities/local-setting.enum';
import { SessionSetting } from '../entities/session-setting.enum';
import { BoardSetting } from '../entities/board-setting.enum';
import Store from './store';
import { CreateCbItem } from '../entities/create-cb-item.if';
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_RESULT_PAGE } from '../constants/cb-import-defaults';
import { FilterCriteria } from '../entities/filter-criteria.enum';

/**
 * Provides an interface to the codeBeamer API.
 */
export default class CodeBeamerService {
  private static instance: CodeBeamerService;

  private store: Store;

  private readonly ITEMS_QUERY_PATH = '/items/query';

  private constructor(store: Store) {
    this.store = store;
  }

  /**
   * @returns Reference to the CodeBeamerService instance
   */
  public static getInstance(): CodeBeamerService {
    if(!this.instance) {
      this.instance = new CodeBeamerService(Store.getInstance());
    }
    return this.instance;
  }

  /**
   * Makes a call to the codeBeamer API's /items/query endpoint with given parameters.
   * @param cbqlQuery Query to fetch data with
   * @param pageSize Amount of items to load per page
   * @param page Result-Page to load
   * @returns Returns matching data for given {@link cbqlQuery} on the {@link page}-th page of the query results. 
   */
  public async getCodeBeamerCbqlResult(cbqlQuery, page = DEFAULT_RESULT_PAGE, pageSize = DEFAULT_ITEMS_PER_PAGE): Promise<any> {
    let url = this.getApiBasePath()
    url.pathname = url.pathname + this.ITEMS_QUERY_PATH;

    let reqBody = JSON.stringify({
      "page": page,
      "pageSize": pageSize,
      "queryString": cbqlQuery,
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getCbHeaders(),
        body: reqBody
      });

      return response.json();
    } catch (err) {
      console.error(err);
      throw new Error(`Failed loading CBQL results. Status: ${err.status}`);
    }
  }

  /**
   * Creates the standard headers required for a request to the codeBeamer API, consisting of content-type and authorization specifications.
   * @returns HTTP Request Headers for making a codeBeamer API request.
   */
  private getCbHeaders(): Headers {
    let headers = new Headers({
      'Content-Type': 'application/json'
    })

    let username = this.store.getLocalSetting(LocalSetting.CB_USERNAME)
    let password = this.store.getSessionSetting(SessionSetting.CB_PASSWORD)

    headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    return headers;
  }

  /**
   * Constructs an URL out of the value saved as cbAddress in the settings.
   * @returns An URL pointing to the codeBeamer address as saved in the settings.
   */
  private getBaseUrl(): URL {
    try {
      let cbAddress = this.store.getBoardSetting(BoardSetting.CB_ADDRESS)
      return new URL(cbAddress)
    } catch (error) {
      miro.showErrorNotification(error);
      miro.board.ui.openModal('picker.html');
      return new URL('');
    }
  }
  
  /**
   * Constructs the base URL to the codeBeamer API
   * @returns The base path to the codeBeamer swagger API
   */
  private getApiBasePath() {
    let url = this.getBaseUrl()
    url.pathname = url.pathname + '/api/v3'
    return url;
  }
  
  /**
   * Constructs the URL to fetch given item's page with.
   * @param itemId Id of the item in question, as number or string
   * @returns URL to the codeBeamer page for given item
   */
  public getItemURL(itemId: string) {
    let url = this.getBaseUrl()
    url.pathname = url.pathname + `/issue/${itemId}`
    return url
  }

  /**
   * Makes a call to the codeBeamer API to convert a string containing codeBeamer-wiki formatting to HTML.
   * <p>
   * Although the produced HTML will have little effect next to getting rid of the cb-wiki special characters, which it mainly serves to.
   * </p>
   * @param wikiText Text containing codeBeamer wiki formatting
   * @param trackerItem CodeBeamr item containint the wikiText
   * @returns Given wikiText with cb-wiki special characters replaced by HTML
   */
  private async convertWiki2Html(wikiText: string, trackerItem): Promise<string> {
    wikiText = this.encodeSpecialChars(wikiText);

    const requestUrl = `${this.getApiBasePath()}/projects/${trackerItem.tracker.project.id}/wiki2html`;
  
    let requestBody = JSON.stringify({
      contextId: trackerItem.id,
      contextVersion: trackerItem.version,
      renderingContextType: "TRACKER_ITEM",
      markup: wikiText
    });

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: this.getCbHeaders(),
        body: requestBody,
      });
      return await response.text()
    } catch(err) {
      console.error(err);
        console.warn(`Failed converting ${trackerItem.name}'s description to HTML. It might therefore look a little weird. This is a known issue, which is being worked on.`)
        return wikiText;
      }
  }
  
  /**
   * Encodes potential special chars, which codebeamer can't deal with very well.
   * <p>
   * Certain special characters in the text can cause the cb /wiki2Html endpoint to take a minute to process (per affected item), which is way too long.
   * This pre-processing aims to ensure these requests are always quick.
   * </p>
   * @param wikiText Text to cleanse
   * @returns Input with encoded special characters, processable by cb's /wiki2Html endpoint
   */
 private encodeSpecialChars(wikiText: string): string {
    //only "extensive" mode cleanses all special chars which codeBeamer seems to have troubles with
    wikiText = encode(wikiText, { mode: 'extensive' });
  
    //return some specific cb wiki markup chars to their original form, or codeBeamer won't be able to recognize them as wiki-markup to be converted to html and the whole call becomes redundant
    wikiText = wikiText.replace(/&percnt;/g, "%").replace(/&excl;/g, "!").replace(/&semi;/g, ";").replace(/&colon;/g, ":").replace("/&comma;/g", ",").replace(/&lpar;/g, "(").replace(/&rpar;/g, ")").replace(/&bsol;/g, "\\").replace(/&NewLine;/g, "\n");
  
    return wikiText;
  }
  
  /**
   * Fetches a user's data from the cb API. Usually just used to check that connection to the API is established and authorized.
   * @param username CodeBeamer username of the user in question
   * @returns The user's codeBeamer account data
   */
  public async getCodeBeamerUser(username?: string): Promise<any> {
    if (!username) username = this.store.getLocalSetting(LocalSetting.CB_USERNAME)
    const requestUrl = `${this.getApiBasePath()}/users/findByName?name=${username}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getCbHeaders(),
      });
      if(!response.ok) {
        //wouldn't throw a catchable error without this..
        throw new Error(response.status.toString());
      }
      return await response.json();
    } catch (err){
      throw new Error(`Failed getting data for user ${username}: ${err}`);
    };
  }
  
  /**
   * Fetches information about a project's trackers
   * @param projectId ID of the project in question
   * @returns All a Project's trackers
   */
  public async getCodeBeamerProjectTrackers(projectId?: string): Promise<any> {
    if (!projectId) {
      try {
        projectId = Store.getInstance().getBoardSetting(BoardSetting.PROJECT_ID);
      } catch (error) {
        miro.showErrorNotification(error);
        miro.board.ui.openModal('picker.html');
      }
    }
    const requestUrl = `${this.getApiBasePath()}/projects/${projectId}/trackers`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getCbHeaders(),
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      throw new Error(`Failed getting Trackers for project ${projectId}: ${err.status}`);
    }
  }
  
  /**
   * Fetches information about a specific tracker
   * @param trackerId Tracker in question
   * @returns Details of the tracker in question
   */
  async getCodeBeamerTrackerDetails(trackerId: string): Promise<any> {
    const requestUrl = `${this.getApiBasePath()}/trackers/${trackerId}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getCbHeaders(),
      });
      return await response.json();
    } catch (err) {
      console.error(err);
      throw new Error(`Failed getting details of Tracker ${trackerId}: ${err.status}`);
    }
  }
  
  /**
   * Fetches an item's outgoing relations (outgoing associations & upstream references)
   * @param itemId Id of the item in question
   * @returns The item's outgoing associations concatenated to its upstream references.
   */
  async getCodeBeamerOutgoingRelations(itemId: string): Promise<any> {
    const requestUrl = `${this.getApiBasePath()}/items/${itemId}/relations`;

    try {
      const response =  await fetch(requestUrl, {
        method: 'GET',
        headers: this.getCbHeaders(),
      });
      const relations = await response.json();
      return relations.outgoingAssociations.concat(relations.upstreamReferences);
    } catch (err) {
      console.error(err);
      throw new Error(`Failed getting outgoing relations for item ${itemId}: ${err.status}`);
    }
  }
  
  /**
   * Fetches details on an association
   * @param association Id of the association in question
   * @returns 
   */
  async getCodeBeamerAssociationDetails(associationId: string) {
    const requestUrl = `${this.getApiBasePath()}/associations/${associationId}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: this.getCbHeaders(),
      })
      return response.json();
    } catch (err) {
      console.error(err);
      throw new Error(`Failed getting association details for association ${associationId}: ${err.status}`);
    }
  }

  /**
   * @param trackerId Id of the tracker in question
   * @returns Detailed list of the given Tracker's properties (the schema).
   */
  async getTrackerSchema(trackerId: string): Promise<any> {
    const path = `/trackers/${trackerId}/schema`;

    const response = await this.get(path, '', 'Failed fetching Tracker schema');
    return response.json();
  }
  
  /**
   * Enriches given item's data by providing more details on its tracker and a more detailed description.
   * @param cbItem Codebeamer item to enrich
   * @returns Enriched item
   */
  async enrichBaseCbItemWithDetails(cbItem): Promise<any> {
    //TODO why exactly is this used/needed ...?

    cbItem.tracker = await this.getCodeBeamerTrackerDetails(cbItem.tracker.id.toString())
    
    cbItem.renderedDescription = "";
    if(cbItem.description)
        if(cbItem.descriptionFormat === 'Wiki'){
          cbItem.renderedDescription = await this.convertWiki2Html(cbItem.description, cbItem);
        } else
        { 
          cbItem.renderedDescription = cbItem.description;
        }
    return cbItem;
  }

  /**
 * Creates a codeBeamer item based on a miro item.
 * <p>
 * The item is created in the "Inbox tracker" defined by it's id in the plugin's settings.
 * If any part of the operation fails, the settings modal is opened and an error message is displayed.
 * </p>
 * @param item CbItem to create
 * @returns Created item's data
 */
    async create(item: CreateCbItem): Promise<any> {
    let trackerId;
    try {
      trackerId = this.store.getBoardSetting(BoardSetting.INBOX_TRACKER_ID);
    } catch (error) {
      miro.showErrorNotification('You must define an "Inbox Tracker ID" first!');
      miro.board.ui.openModal('picker.html');
    }

    if(item.description) {
      item.description = sanitizeHtml(
        item.description,
        { 
          allowedTags: [], 
          allowedAttributes: {} 
        });
    }

    const requestUrl = `${this.getApiBasePath()}/trackers/${trackerId}/items`;

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: this.getCbHeaders(),
        body: JSON.stringify(item),
      })
      return response.json();
    } catch (err) {
      console.error(err);

      //TODO outsource
      miro.board.ui.openModal('settings.html');
      miro.showErrorNotification(`Please verify the settings are correct. Error: ${err}`)

      throw new Error(`Please verify the settings are correct. ErrorCode: ${err.status}`);
    }
  }

  /**
   * Maps FilterCriteria enum values to codeBeamer Query language entity names
   * @param criteria FilterCriteria as enum value or string (for custom fields)
   * @param trackerId Optional trackerId (required only for custom fields)
   * @returns the matching codebeamer query language entity's name to a Filter Criteria, e.g. "teamName" for Team.
   */
  public static getQueryEntityNameForCriteria(criteria: FilterCriteria | string, trackerId?: string): string {
    switch(criteria) {
      case FilterCriteria.TEAM: return 'teamName';
      case FilterCriteria.RELEASE: return 'release';
      case FilterCriteria.SUBJECT: return 'subjectName';
      default: return `${trackerId ?? ''}.${criteria}`;
    }
  }
  
  /**
   * Generic method to POST to the codeBeamer API
   * @param path Specific path to add to the default API path
   * @param body Request payload
   * @param errorMessage An optional message to throw when a request error occurs.
   * @returns The API's response for further processing/data extraction
   */
   private async post(path: string, body: any, errorMessage?: string): Promise<Response> {
    let url = this.getApiBasePath();
    url.pathname += path;

    const requestUrl = url.toString();

    try {
      return await fetch(requestUrl, {
        method: 'POST',
        headers: this.getCbHeaders(),
        body: body
      });
    } catch (err) {
      if(errorMessage) {
        throw new Error(`${errorMessage} | Status: ${err.status}`);
      } else {
        throw err;
      }
    }
  }

  /**
   * Generic method to GET to the codeBeamer API
   * @param path Specific path to add to the default API path
   * @param query Optional serach/query GET-parameters. Can also just be included in the {@link path} parameter
   * @param errorMessage An optional message to throw when a request error occurs.
   * @returns The API's response for further processing/data extraction
   */
  private async get(path: string, query?: string, errorMessage?: string): Promise<Response> {
    let url = this.getApiBasePath();
    url.pathname += path;
    if(query) url.search = query;

    const requestUrl = url.toString();

    try {
      return await fetch(requestUrl, {
        method: 'GET',
        headers: this.getCbHeaders(),
      });
    } catch (err) {
      if(errorMessage) {
        throw new Error(`${errorMessage} | Status: ${err.status}`);
      } else {
        throw err;
      }
    }
  }

  /**
	 * Converts a Miro widget to a CbItem
	 * @param widget Miro widget in question
	 * @returns CbItem based on given Miro widget
	 */
	public static convert2CbItem(widget): CreateCbItem {
		let item = {
			name: "New Item",
			description: "--",
		};
		switch (widget.type) {
			case "CARD":
				const nameNoHtml = this.strip(widget.title);
				if (nameNoHtml) item.name = nameNoHtml;
				if (widget.description) item.description = widget.description;
				break;
			case "SHAPE":
			case "STICKER":
				if (widget.plainText) item.name = widget.plainText;
				break;
			case "TEXT":
				if (widget.text) item.name = widget.text;
				break;
			default:
				throw new Error(`Widget type '${widget.type}' not supported`);
		}
		return item;
	}

  private static strip(html) {
		let doc = new DOMParser().parseFromString(html, "text/html");
		return doc.body.textContent;
	}
}
