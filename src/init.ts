import {
	CODEBEAMER_DOWNLOAD,
	CODEBEAMER_SETTINGS,
	CODEBEAMER_UPLOAD,
} from "./constants/svg";
import AppIdentity from "./services/app-identity";
import CodeBeamerService from "./services/codebeamer";
import MiroService from "./services/miro";

miro.onReady(() => {
	miro.initialize({
		extensionPoints: {
			//// make new icon that shows "refresh" -> sync all current items
			//bottomBar: {
			//  title: 'CodeBeamer Sync',
			//  svgIcon: CODEBEAMER_ICON,
			//  onClick: syncWithCodeBeamer,
			//},
			toolbar: {
				title: "Import Items from codeBeamer",
				librarySvgIcon: CODEBEAMER_DOWNLOAD,
				toolbarSvgIcon: CODEBEAMER_DOWNLOAD,
				onClick: () => {
					CodeBeamerService.getInstance()
						.getCodeBeamerUser()
						.then(() => miro.board.ui.openModal("picker.html"))
						.catch((err) => {
							miro.showErrorNotification(
								`CodeBeamer connection could not be established. Please fix the Connection settings.`
							);
							miro.board.ui.openModal("settings.html");
						});
				},
			},
			getWidgetMenuItems: function (selectedWidgets) {
				var menuItems: SDK.IWidgetMenuItem[] = [];
				if (isSelectionConvertable(selectedWidgets))
					menuItems.push({
						tooltip: "Convert to codeBeamer Tracker",
						svgIcon: CODEBEAMER_UPLOAD,
						onClick: () => {
              if(!selectedWidgets.length || selectedWidgets.length > 1) {
                miro.showErrorNotification("You can currently only create one item at a time.")
                return;
              }
              MiroService.getInstance().createFromWidget(
								selectedWidgets[0]
							)},
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
	console.log(
		`[codeBeamer-sync] Plugin v0.2.30 initialized. Experiencing issues? Let us know at https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues`
	);
	miro.isAuthorized().then((isAuthorized) => {
		if (!isAuthorized) {
			miro.requestAuthorization();
		}
	});
});

function isSettingsWidget(widget: SDK.IWidget) {
	return (
		widget.metadata &&
		widget.metadata[AppIdentity.AppId] &&
		widget.metadata[AppIdentity.AppId].settings
	);
}

function isSettingsWidgetSelected(selectedWidgets: SDK.IWidget[]) {
	return selectedWidgets.length === 1 && isSettingsWidget(selectedWidgets[0]);
}

function isWidgetConvertable(widget: SDK.IWidget) {
	let supportedWidgetTypes = ["STICKER", "CARD", "TEXT", "SHAPE"];
	return (
		(!widget.metadata || !widget.metadata[AppIdentity.AppId]) && // only allow items NOT created by this plugin
		supportedWidgetTypes.includes(widget.type)
	); // only allow supported types
}

function isSelectionConvertable(selectedWidgets: SDK.IWidget[]) {
	// only single selection supported
	return (
		selectedWidgets.length === 1 && isWidgetConvertable(selectedWidgets[0])
	);
}
