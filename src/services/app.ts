import {
	PLUGIN_WIDGET_DESCRIPTION,
	PLUGIN_WIDGET_TITLE,
} from "../constants/plugin-widget";
import { CardData } from "../entities/carddata.if";
import MiroService from "./miro";
import Store from "./store";

/**
 * Class representing an application instance (more or less..).
 */
export default class App {
	private static _instance: App;

	public static state: any = {
		onReadyCalled: false,
		onReadyFuncs: [],
	};
  
  private static configInitCalled: boolean = false;
  
  private _configWidget: SDK.ICardWidget;

	private constructor() {}

  public static create() {
    this._instance = new App();

    App.onAllWidgetsLoaded(async () => {
			await this._instance.initConfigCard();
			App.runOnPluginReadyFuncs();
		});

    return this._instance;
  }

	public static getInstance() {
		if (!this._instance) {
      throw new Error("App not initialized:");
    }
		return this._instance;
	}

	public get configWidget(): SDK.ICardWidget {
		return this._configWidget;
	}

	public static onPluginReady(func: { (): Promise<void> }) {
		if (this.state.onReadyCalled) {
			func();
		} else {
			this.state.onReadyFuncs.push(func);
		}
	}

	public static runOnPluginReadyFuncs() {
		App.state.onReadyCalled = true;
		while (App.state.onReadyFuncs.length) {
			App.state.onReadyFuncs.shift().call();
		}
	}

	/**
	 * Initializes (creates and/or saves reference to) the plugin's config widget, which serves
	 * to access (and formerly store in it's metadata) plugin-settings.
	 */
	public async initConfigCard() {
		// do nothing if already initialized
		if (App.configInitCalled) return;
		App.configInitCalled = true;

		// try to find the widget
		let settingsWidget = (await miro.board.widgets.get({ type: "CARD" }))
			.filter((widget) => !!widget.metadata[Store.getInstance().appId])
			.find(
				(widget) => !!widget.metadata[Store.getInstance().appId].settings
			) as SDK.ICardWidget;

		// create if not exists
		if (!settingsWidget) {
			let cardData: CardData = {
				type: "CARD",
				title: PLUGIN_WIDGET_TITLE,
				description: PLUGIN_WIDGET_DESCRIPTION,
				capabilities: { editable: false },
				metadata: {
					[Store.getInstance().appId]: {
						settings: {},
					},
				},
				card: {
					logo: {
						iconUrl: `${window.location.href}img/codeBeamer-Logo.png`,
					},
				},
				style: { backgroundColor: "#00A85D" },
			};
			settingsWidget =
				(await MiroService.getInstance().createOrUpdateWidget(
					cardData
				)) as SDK.ICardWidget;
		}

		this._configWidget = settingsWidget;
	}

	public static async onAllWidgetsLoaded(callback) {
		const allWidgetsLoaded = await miro.board.widgets.areAllWidgetsLoaded();
		if (allWidgetsLoaded) {
			callback();
		} else {
			miro.addListener("ALL_WIDGETS_LOADED", callback);
		}
	}
}
