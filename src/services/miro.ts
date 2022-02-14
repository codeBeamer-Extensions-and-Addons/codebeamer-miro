import { BoardSetting, CardData, ImportConfiguration, StandardItemProperty } from "../entities";
import { CB_ITEM_NAME_PROPERTY_NAME, RELATION_OUT_ASSOCIATION_TYPE, CODEBEAMER_ASSOCIATIONS, WIDGET_INITIAL_POSITION } from "../constants";
import CodeBeamerService from "./codebeamer";
import Store from "./store";

export default class MiroService {
	private static instance: MiroService;

	public constructor() {}

	public static getInstance(): MiroService {
		if (!this.instance) this.instance = new MiroService();
		return this.instance;
	}

	async getAllSynchedCodeBeamerCardItemIds() {
		return (
			await miro.board.widgets.get({
				type: "CARD",
			})
		)
			.filter(
				(widget) =>
					widget.metadata[Store.getInstance().appId] &&
					widget.metadata[Store.getInstance().appId].id
			)
			.map((widget) => widget.metadata[Store.getInstance().appId].id as string);
	}

	async getWidgetDetail(widget) {
		return (await miro.board.widgets.get(widget))[0];
	}

	async findWidgetByTypeAndMetadataId(
		widgetData
	): Promise<SDK.IWidget | undefined> {
		return miro.board.widgets
			.get({
				type: widgetData.type,
			})
			.then((widgets) =>
				widgets
					.filter((widget) => !!widget.metadata[Store.getInstance().appId])
					.find(
						(widget) =>
							widget.metadata[Store.getInstance().appId].id ===
							widgetData.metadata[Store.getInstance().appId].id
					)
			);
	}

	async findLinesByFromCard(fromCardId) {
		return (
			await miro.board.widgets.get<SDK.ILineWidget>({
				type: "LINE",
			})
		).filter(
			(line) =>
				line.metadata[Store.getInstance().appId] &&
				line.startWidgetId === fromCardId
		);
	}

	async createOrUpdateWidget(widgetData) {
		const existingWidget = await this.findWidgetByTypeAndMetadataId(
			widgetData
		);
		if (existingWidget) {
			widgetData.id = existingWidget.id;
			return this.updateWidget(widgetData);
		} else {
			return this.createWidget(widgetData);
		}
	}

	async createOrUpdateCbItem(cbItem) {
		await CodeBeamerService.getInstance().enrichBaseCbItemWithDetails(
			cbItem
		);
		let cardData = await MiroService.getInstance().convert2Card(cbItem);
		cbItem.card = await this.createOrUpdateWidget(cardData);

		//way of showing progress
		miro.showNotification(`Created/Updated widget for "${cbItem.name}"`);

		return cbItem;
	}

	async createWidget(widgetData) {
		// if x and y are not set, set them to middle of current screen
		if (widgetData.type === "CARD" && (!widgetData.x || !widgetData.y)) {
			const viewport = await miro.board.viewport.get();
			let randomXOffset = (Math.random() * viewport.width) / 4;
			let randomYOffset = (Math.random() * viewport.height) / 4;
			widgetData.x = viewport.x + viewport.width / 2 + randomXOffset;
			widgetData.y = viewport.y + viewport.height / 2 + randomYOffset;
		}
		let widget;
		try {
			widget = (await miro.board.widgets.create(widgetData))[0];
		} catch (error) {
			console.error(error);
		}
		let itemId = widget.metadata[Store.getInstance().appId].id;
		console.info(
			`[codeBeamer-sync] ${widget.type} widget ${
				widget.id
			} has been created to match item ${
				itemId ? itemId : "<the settings>"
			}`
		);
		return widget;
	}

	/**
	 * Submits given widget to be turned into a codeBeamer item and (re-)create the matching card widget.
	 * @param widget Widget to create a codeBeamer item from.
	 */
	async createFromWidget(widget) {
		// get widget with all meta data (the selected one only has the general widget properties, but is lacking the type specifcs)
		widget = await this.getWidgetDetail({ id: widget.id });
		// generate submission object and submit
		let submissionItem = CodeBeamerService.convert2CbItem(widget);
		let cbItem;
		try {
			cbItem = await CodeBeamerService.getInstance().create(
				submissionItem
			);
		} catch (err) {
			miro.board.ui.openModal("settings.html");
			miro.showErrorNotification(err);
			return;
		}

		// create new item in same position as old one
		cbItem[WIDGET_INITIAL_POSITION] = { x: widget.x, y: widget.y };

		// delete old widget
		this.deleteWidget(widget);
		//create new widget and select it (just to focus)
		await this.createOrUpdateCbItem(cbItem);
		miro.board.selection.selectWidgets({ id: cbItem.card.id });

		//currently no need to sync associations as the item was just created without possibly having any.
	}

	async updateWidget(widgetData) {
		let widget = (await miro.board.widgets.update(widgetData))[0];
		let itemId = widget.metadata[Store.getInstance().appId].id;
		console.info(
			`[codeBeamer-sync] ${widget.type} widget ${
				widget.id
			} has been updated to match item ${
				itemId ? itemId : "<the settings>"
			}`
		);
		return widget;
	}

	// temporary function to recreate the settings widget as metadata are currently only persisted when set on creation
	// https://community.miro.com/developer-platform-and-apis-57/metadata-updated-are-not-persistent-4761
	async recreateWidget(widgetData) {
		await this.deleteWidget(widgetData.id);
		widgetData.id = undefined;
		return this.createWidget(widgetData);
	}

	async deleteWidget(widgetData) {
		return miro.board.widgets.deleteById(widgetData);
	}

	getCurrentUserId() {
		return miro.currentUser.getId();
	}

	public async convert2Card(item): Promise<CardData> {
		let cardData: CardData = {
			type: "CARD",
			title: `<a href="${CodeBeamerService.getInstance().getItemURL(
				item.id.toString()
			)}">[${item.tracker.keyName}-${item.id}] - ${item.name}</a>`,
			description: item.renderedDescription,
			card: {
				logo: {
					iconUrl: `${
						new URL(window.location.href).origin
					}/img/codeBeamer-Logo-BW.png`,
				},
				customFields: [],
			},
			capabilities: {
				editable: false,
			},
			metadata: {
				[Store.getInstance().appId]: {
					id: item.id,
				},
			},
		};

		this.addCustomCardFields(cardData, item);

		// background Color
		let colorFieldValue = this.findColorFieldOnItem(item);
		let backgroundColor = colorFieldValue
			? colorFieldValue
			: item.tracker.color
			? item.tracker.color
			: null;
		if (backgroundColor) {
			cardData.style = { backgroundColor: backgroundColor };
		}

		if (item[WIDGET_INITIAL_POSITION]) {
			cardData.x = item[WIDGET_INITIAL_POSITION].x;
			cardData.y = item[WIDGET_INITIAL_POSITION].y;
		}

		return cardData;
	}

	private addCustomCardFields(cardData, item) {
		//custom tags according to import Configuration
		let importConfiguration: ImportConfiguration;
		const NO_IMPORT_CONFIGURATION = "No import configuration defined";
		try {
			importConfiguration = Store.getInstance().getBoardSetting(BoardSetting.IMPORT_CONFIGURATION);

			if(!importConfiguration) throw new Error(NO_IMPORT_CONFIGURATION);

			const standardConfiguration = importConfiguration.standard;
			const standardConfigurationKeys = Object.keys(standardConfiguration);
			//a foreach on Object.keys got me the ky's indexes instead of keys as entries.
			for(let i = 0; i < standardConfigurationKeys.length; i++) {
				const key = standardConfigurationKeys[i] as StandardItemProperty;
				const value = standardConfiguration[key];

				if(value == false) continue;

				const itemPropertyName = this.getCodeBeamerPropertyNameByFieldLabel(key);
				if(!item[itemPropertyName]) continue;
				let field = item[itemPropertyName];

				let content: string;

				if(field == null) continue;

				if(typeof field === 'object') {
					if(Array.isArray(field)) {
						//* display comma-seperated names of all entries
						content = '';
						for(let j = 0; j < field.length; j++) {
							let entry = field[j];
							let slug = entry[CB_ITEM_NAME_PROPERTY_NAME];
							content += `${slug}, `;
						}
						//remove trailing ", "
						content = content.substring(0, content.length-2);
					} else {
						//* display the name-property
						content = field[CB_ITEM_NAME_PROPERTY_NAME];
					}
				} else {
					//* just show the field
					content = field.toString();
				}

				let customField = {
					//TODO custom colors
					mainColor: this.getColorForFieldLabel(key),
					fontColor: "#ffffff",
					value: `${key}: ${content}`,
				};
				cardData.card?.customFields?.push(customField);
			}
		} catch (error) {
			if(error.message !== NO_IMPORT_CONFIGURATION) {
				miro.showErrorNotification("Something went wrong creating Tags for your item.");
				console.error(error);
			}
		}

		//status is always displayed, if the item has one
		if(item.status) {
			cardData.card?.customFields?.push({
				mainColor: "#4f8ae8",
				fontColor: "#ffffff",
				value: `Status: ${item.status.name}`,
			});
		}

		return cardData;
	}

	/**
	 * Creates an {@link ILineWidget} based on the given data
	 * @param relation CodeBeamer relation to visualize
	 * @param fromCardId Id of the card to start the line from
	 * @param toCardId Id of the card to lead the line to
	 * @returns {@link ILineWidget} from {@link fromCardId} to {@link toCardId} with a customized style, defined by the {@link relation}'s type
	 */
	async convert2Line(relation, fromCardId, toCardId) {
		let caption = '';
		let relationDetails: any;
		
		if (relation.type === RELATION_OUT_ASSOCIATION_TYPE) {
			relationDetails =
			await CodeBeamerService.getInstance().getCodeBeamerAssociationDetails(
				relation.id.toString()
				);
			caption = CODEBEAMER_ASSOCIATIONS.find(type => type.id == relationDetails.type.id)?.name ?? '';
		}

		return {
			type: "LINE",
			startWidgetId: fromCardId,
			endWidgetId: toCardId,
			style: this.getLineStyle(relationDetails),
			captions: [{ text: caption }],
			capabilities: {
				editable: false,
			},
			metadata: {
				[Store.getInstance().appId]: {
					id: relation.id,
				},
			},
		};
	}

	/**
	 * Creates the miro {@link ILineWidget}'s style object depending on what relation is given
	 * @param relation CodeBeamer relation
	 * @returns An object containing the styles definition for given relation
	 */
	getLineStyle(relation?: any): { lineColor: string, lineEndStyle: string, lineStartStyle: string, lineStyle: string, lineThickness: number, lineType: string} {
		let style: any = {
			lineType: miro.enums.lineType.ARROW,
			lineStyle: miro.enums.lineStyle.NORMAL,
			lineEndStyle: miro.enums.lineArrowheadStyle.ARROW,
			lineStartStyle: miro.enums.lineArrowheadStyle.NONE,
			lineThickness: 2,
			lineColor: "#000000",
		};

		if (relation) {
			let associationType = CODEBEAMER_ASSOCIATIONS.find(type => type.id == relation.type.id);
			if(associationType) {
				style.lineColor = associationType.color;
			}
			style.lineStyle = miro.enums.lineStyle.DASHED;
		}
		return style;
	}

	findColorFieldOnItem(item) {
		var colorField = item.customFields
			? item.customFields.find(
					(field) => field.type === "ColorFieldValue"
			  )
			: null;
		return colorField ? colorField.value : null;
	}

	/**
	 * Gets the static codeBeamer Item property name for a {@link StandardItemProperty} value
	 * @param fieldLabel 
	 * @returns Name of the codeBeamer item property labelled by {@link fieldLabel}
	 */
	private getCodeBeamerPropertyNameByFieldLabel(fieldLabel: StandardItemProperty): string {
		switch(fieldLabel) {
			case StandardItemProperty.ID: return "id";
			case StandardItemProperty.TEAMS: return "teams";
			case StandardItemProperty.OWNER: return "owners";
			case StandardItemProperty.RELEASE: return "release";
			case StandardItemProperty.PRIORITY: return "namedPriority";
			case StandardItemProperty.STORY_POINTS: return "storyPoints";
			case StandardItemProperty.START_DATE: return "startDate";
			case StandardItemProperty.END_DATE: return "endDate";
			case StandardItemProperty.ASSIGNED_TO: return "assignedTo";
			case StandardItemProperty.ASSIGNED_AT: return "assignedAt";
			case StandardItemProperty.SUBMITTED_AT: return "submittedAt";
			case StandardItemProperty.SUBMITTED_BY: return "submitter";
			case StandardItemProperty.MODIFIED_AT: return "modifiedAt";
			case StandardItemProperty.MODIFIED_BY: return "modifier";
		}
	}

	/**
	 * Gets the static color for a given property, to be used as background for its custom card field.
	 * @param fieldLabel Fieldlabel to get color for
	 * @returns Color to use as background for creating custom card fields for given {@link fieldLabel}
	 */
	private getColorForFieldLabel(fieldLabel: StandardItemProperty): string {
		switch(fieldLabel) {
			case StandardItemProperty.ID: return "#bf4040";
			case StandardItemProperty.TEAMS: return "#40bf95";
			case StandardItemProperty.OWNER: return "#4095bf";
			case StandardItemProperty.RELEASE: return "#406abf";
			case StandardItemProperty.PRIORITY: return "#40bfbf";
			case StandardItemProperty.STORY_POINTS: return "#bfbf40";
			case StandardItemProperty.START_DATE: return "#9540bf";
			case StandardItemProperty.END_DATE: return "#bf40bf";
			case StandardItemProperty.ASSIGNED_TO: return "#95bf40";
			case StandardItemProperty.ASSIGNED_AT: return "#6abf40";
			case StandardItemProperty.SUBMITTED_AT: return "#40bf6a";
			case StandardItemProperty.SUBMITTED_BY: return "#40bf40";
			case StandardItemProperty.MODIFIED_AT: return "#bf9540";
			case StandardItemProperty.MODIFIED_BY: return "#bf6840";
			default: return '#303030'
		}
	}
}
