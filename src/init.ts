import {
	CODEBEAMER_DOWNLOAD,
	CODEBEAMER_SETTINGS,
	CODEBEAMER_UPLOAD,
} from "./constants/svg";
import CodeBeamerService from "./services/codebeamer";
import App from "./services/app";
import MiroService from "./services/miro";
import Store from "./services/store";

miro.onReady(async () => {
	App.create();
	Store.create(miro.getClientId(), (await miro.board.info.get()).id);
	
	if (!(await miro.isAuthorized())) {
		await miro.requestAuthorization();
	}

	await miro.initialize({
		extensionPoints: {
			toolbar: {
				title: "Import Items from codeBeamer",
				librarySvgIcon: CODEBEAMER_DOWNLOAD,
				toolbarSvgIcon: CODEBEAMER_DOWNLOAD,
				onClick: async () => {
					try {
						await CodeBeamerService.getInstance().getCodeBeamerUser();
						miro.board.ui.openModal("picker.html", { width: 1080, height: 680});
					} catch (err) {
						console.error(err);
						miro.showErrorNotification(
							`CodeBeamer connection could not be established. Please check the Connection settings.`
						);
						miro.board.ui.openModal("settings.html");
					};
				},
			},
			getWidgetMenuItems: function (selectedWidgets) {
				var menuItems: SDK.IWidgetMenuItem[] = [];
				if (isSelectionConvertable(selectedWidgets))
					menuItems.push({
						tooltip: "Convert to codeBeamer Tracker",
						svgIcon: CODEBEAMER_UPLOAD,
						onClick: () => {
							if (
								!selectedWidgets.length ||
								selectedWidgets.length > 1
							) {
								miro.showErrorNotification(
									"You can currently only create one item at a time."
								);
								return;
							}
							MiroService.getInstance().createFromWidget(
								selectedWidgets[0]
							);
						},
					});
				if (isSettingsWidgetSelected(selectedWidgets))
					menuItems.push({
						tooltip: "Open codeBeamer-sync settings",
						svgIcon: CODEBEAMER_SETTINGS,
						onClick: () => {
							miro.board.ui.openModal("settings.html");
						},
					});
				// if (isSelectionOpenable(selectedWidgets))
				//   menuItems.push(
				//     {
				//       tooltip: "Open in CodeBeamer",
				//       svgIcon: OPEN_ITEM_ICON,
				//       onClick: () => openInCodeBeamer(selectedWidgets),
				//     })
				return Promise.resolve(menuItems);
			},
		},
	});

	console.info(
		`[codeBeamer-sync] Plugin v0.6.1 initialized. Experiencing issues? Let us know at https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues`
	);
});

function isSettingsWidget(widget: SDK.IWidget) {
	return (
		widget.metadata &&
		widget.metadata[Store.getInstance().appId] &&
		widget.metadata[Store.getInstance().appId].settings
	);
}

function isSettingsWidgetSelected(selectedWidgets: SDK.IWidget[]) {
	return (
		selectedWidgets.length === 1 &&
		isSettingsWidget(selectedWidgets[0])
	);
}

function isWidgetConvertable(widget: SDK.IWidget) {
	let supportedWidgetTypes = ["STICKER", "CARD", "TEXT", "SHAPE"];
	return (
		(!widget.metadata || !widget.metadata[Store.getInstance().appId]) && // only allow items NOT created by this plugin
		supportedWidgetTypes.includes(widget.type)
	); // only allow supported types
}

function isSelectionConvertable(selectedWidgets: SDK.IWidget[]) {
	// only single selection supported
	return (
		selectedWidgets.length === 1 &&
		isWidgetConvertable(selectedWidgets[0])
	);
}
