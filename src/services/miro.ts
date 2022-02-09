import { BoardSetting, CardData, codeBeamerPropertyNamesByFieldLabel, ImportConfiguration } from "../entities";
import { CB_ITEM_NAME_PROPERTY_NAME, RELATION_OUT_ASSOCIATION_TYPE, RELATION_UPSTREAM_REF_TYPE, WIDGET_INITIAL_POSITION } from "../constants";
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
		let widget = (await miro.board.widgets.create(widgetData))[0];
		let itemId = widget.metadata[Store.getInstance().appId].id;
		console.log(
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
		console.log(
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
				const key = standardConfigurationKeys[i];
				const value = standardConfiguration[key];

				if(value == false) continue;

				const itemPropertyName = codeBeamerPropertyNamesByFieldLabel[key];
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
							content += `${entry[CB_ITEM_NAME_PROPERTY_NAME]}, `;
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

	async convert2Line(relation, fromCardId, toCardId) {
		return {
			type: "LINE",
			startWidgetId: fromCardId,
			endWidgetId: toCardId,
			style: await this.getLineStyleByRelationType(relation),
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

	async getLineStyleByRelationType(relation) {
		let style: any = {
			lineType: miro.enums.lineType.ARROW,
			lineStyle: miro.enums.lineStyle.NORMAL,
			lineEndStyle: miro.enums.lineArrowheadStyle.ARC_ARROW,
			lineStartStyle: miro.enums.lineArrowheadStyle.NONE,
			lineThickness: 1,
		};

		if (relation.type === RELATION_OUT_ASSOCIATION_TYPE) {
			let associationDetails =
				await CodeBeamerService.getInstance().getCodeBeamerAssociationDetails(
					relation.id.toString()
				);
			switch (associationDetails.type.id) {
				case 1: // depends
					style.lineColor = "#cf7f30"; // orange
					style.lineEndStyle = miro.enums.lineArrowheadStyle.ARROW;
					style.lineThickness = 5;
					break;
				case 4: // related
				case 9: // copy of
					style.lineColor = "#21cfb7"; // turquise
					style.lineStyle = miro.enums.lineStyle.DASHED;
					style.lineStartStyle = 1;
					break;
				case 6: // violates
				case 8: // invalidates
				case 7: // excludes
					style.lineColor = "#b32525"; // red
					break;
				case 2: // parent
				case 3: // child
				case 5: // derived
				default:
				// leave default
			}
		} else if (relation.type === RELATION_UPSTREAM_REF_TYPE) {
			style.lineThickness = 3;
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
}
