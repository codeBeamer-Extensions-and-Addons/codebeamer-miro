import {
	RELATION_OUT_ASSOCIATION_TYPE,
	RELATION_UPSTREAM_REF_TYPE,
} from "../constants/cb-relation-names";
import { CardData } from "../entities/carddata.if";
import { UserMapping } from "../entities/user-mapping.if";
import { WIDGET_INITIAL_POSITION } from "../entities/widget-initial-position-name";
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
				customFields: [
					{
						mainColor: "#4f8ae8",
						fontColor: "#ffffff",
						value: `Status: ${item.status.name}`,
					},
				],
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
		// additional custom fields
		if (item.release) {
			cardData.card?.customFields?.push({
				value: `Rel: ${item.release.name}`,
			});
		}
		if (item.storyPoints) {
			cardData.card?.customFields?.push({
				value: `SP: ${item.storyPoints}`,
			});
		}

		delete cardData.assignee; // so that it gets cleared if no value is set (but was previously set so is current on the card)
		if (item.assignedTo) {
			let mappedUser = item.assignedTo
				.map((assignedUser) => assignedUser.id) // get cbUserID
				.map((cbId: string) =>
					Store.getInstance().getUserMapping({ cbUserId: cbId })
				) // get mapping
				// take the first mapping that is found (some users in CB might not be defined. If multiple are, we only take the first as the field is single select in miro)
				.find((mapping: UserMapping | undefined) => !!mapping);

			if (mappedUser) {
				cardData.assignee = { userId: mappedUser.miroUserId };
			}
		}

		if (item.startDate) {
			let date = new Date(item.startDate).toLocaleDateString();
			let customField = {
				mainColor: "#393b3a",
				fontColor: "#fff",
				value: `Start: ${date}`,
			};
			cardData.card?.customFields?.push(customField);
		}

		if (item.endDate) {
			let date = new Date(item.endDate).toLocaleDateString();
			let customField = {
				mainColor: "#393b3a",
				fontColor: "#fff",
				value: `End: ${date}`,
			};
			cardData.card?.customFields?.push(customField);
		}

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
