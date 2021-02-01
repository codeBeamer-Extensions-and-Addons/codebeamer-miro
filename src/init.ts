import { submitNewCodeBeamerItem, getCodeBeamerUser } from "./components/codebeamer";
import App from './components/app';

const UPLOAD_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 20C16 19.4477 16.4477 19 17 19H20V4H4V19H7C7.55228 19 8 19.4477 8 20C8 20.5523 7.55228 21 7 21H3C2.44772 21 2 20.5523 2 20V3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44771 22 3V20C22 20.5523 21.5523 21 21 21H17C16.4477 21 16 20.5523 16 20Z" fill="#050038"/><path d="M11 21.5V11.9142L9.41421 13.5C9.02369 13.8905 8.39052 13.8905 8 13.5C7.60948 13.1095 7.60948 12.4763 8 12.0858L12 8.08579L16 12.0858C16.3905 12.4763 16.3905 13.1095 16 13.5C15.6095 13.8905 14.9763 13.8905 14.5858 13.5L13 11.9142V21.5C13 22.0523 12.5523 22.5 12 22.5C11.4477 22.5 11 22.0523 11 21.5Z" fill="#050038"/></svg>'
// TODO: Check if should be unused
// const OPEN_ITEM_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5V17H20V14C20 13.4477 20.4477 13 21 13C21.5523 13 22 13.4477 22 14V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V5C2 3.89543 2.89543 3 4 3H11C11.5523 3 12 3.44772 12 4C12 4.55228 11.5523 5 11 5H4Z" fill="#050038"/><path d="M20.0093 6.40496L20 8.99643C19.998 9.54871 20.4442 9.99802 20.9964 9.99999C21.5487 10.002 21.998 9.55585 22 9.00357L22.0214 3H16C15.4477 3 15 3.44772 15 4C15 4.55228 15.4477 5 16 5H18.5858L12.2929 11.2929C11.9024 11.6834 11.9024 12.3166 12.2929 12.7071C12.6834 13.0976 13.3166 13.0976 13.7071 12.7071L20.0093 6.40496Z" fill="#050038"/><path d="M6 21C6 20.4477 6.44772 20 7 20H17C17.5523 20 18 20.4477 18 21C18 21.5523 17.5523 22 17 22H7C6.44771 22 6 21.5523 6 21Z" fill="#050038"/></svg>'
const CODEBEAMER_ICON = '<svg enable-background="new 0 0 256 256" version="1.1" viewBox="0 0 256 256" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#050038"><path class="st0" d="M128,255c70.1,0,127-56.9,127-127S198.1,1,128,1S1,57.9,1,128S57.9,255,128,255"/><path class="st1" d="m142.7 103.9c1.4 12.6 2.6 29.3 21.5 18.5 0.5-0.2 0.9-0.5 1.2-0.7 4.5-6.7-0.2-20.9 5.1-20 5.9 1-1.2 7.6 1.8 12.7 3.1-2.1 3.6-11 7.9-8.3 4.2 2.6-3.4 5.6-3.7 8.9 2.7 1.4 10.4-6 11.4-0.7 0.9 4-9.3 3.4-10.3 5.4 2.1 3.3 12.7 0.7 10.1 6-2.2 4.4-9.4-3.3-13.6-2 1.2 3.7 8.9 4.4 5.7 8-2.9 3.3-6.8-2.5-11.7-7.1-0.6 0.7-1.2 1.4-1.9 2.1-11.9 11.9-26 8.9-33.2-3.5-3.5-6-3.3-9.7-4.3-16.2-1.3 4-2.2 7.8-2.6 11.6-10.5 9.2-19.8 19.1-22.8 34.2 7-5.5 13.6-13.1 20.4-9.8 6.4 3.1 11.4 12.6 13.6 20.2 6.1-2.8 11.2-5.8 12.8-1.6 1.9 5.3-6.8 2.8-9.6 6.4 4 3.1 15.1-2.4 15.7 3.3 0.7 6.9-9.9-0.4-13.6 2.4 0.3 2.6 11.6 6.1 9.1 10.1-3.4 5.3-8.9-5.9-12.3-5.6-1.1 3.8 5.9 10.1 0.3 11.3-5.9 1.2-2.7-8.7-5.2-12.3-5.4 4.2-0.3 14.4-7.2 13.1-6-1.2 4-13.8 2.9-23-2.8-3.3-5.9-6.5-8.9-5.4-6.3 2.5-6.7 9.3-17.9 13.6 8.8 17 33.4 33.9 57.1 32.4 21.4-1.4 46-18.3 36.6-55.5-1.2-4.7-1-6.5 2.1-0.7 14.2 26.8-4.8 72.1-54.3 66.8-58.6-6.2-63.2-56.8-81.2-61.2-4-1-8.1 3.1-11.7 6.2 0.4 8.3 5.1 17.8-0.4 18.4-5.2 0.6-1-6.8-3.7-10.1-3.7 2.9-1.1 14.3-6.5 13.5-6.4-0.9 2.6-8.9 0.8-12.8-2.5-0.3-8.1 9.2-11.2 6-4.2-4.3 7.3-6.7 7.7-9.9-3.2-1.8-10.6 3.2-10.4-2.2 0.2-5.5 8.5-0.5 12.4-2-2.7-5.9-13.1-3.5-10.4-9.5 1.8-3.9 7.4 1.8 13.8 5.3 2-8.1 11.3-21.4 18-21.9 5.4-0.4 9.9 4.1 14.4 8.9-0.2-2.6-0.2-5.2-0.1-7.9 0.5-24.5 9.5-46.2 44.9-61.1 1.4-10.4-9.9-13.4-8-20.8 1.6-5.7 9.5-10.9 16.3-12.7-2.9-5.5-6.5-10.2-2.8-11.9 4.4-2 2.8 5.7 6.1 7.8 2.4-3.6-3-12.7 1.9-13.6 5.8-1 0.2 8.4 2.9 11.4 2.2-0.4 4.4-10.3 8-8.4 4.8 2.6-4.5 7.9-3.9 10.8 3.3 0.7 8.2-5.7 9.6-1 1.4 4.9-7.3 2.8-10.2 5.2 3.9 4.4 12.3-0.5 11.6 5.4-0.6 4.9-10.8-1.8-18.5-1.2-3.3 2.5-7.2 6.1-7 9.4 0.3 5 6.7 9 10.6 13.4 7.4-3.2 6.6-10.9 12-13.8 20-11 51.4 6.3 51.6 14.9 0.1 8.2-17.3 19.7-32.1 23.2-3.5 0.8-6.1-0.5-8.4-1.8-8.8-5.3-11.7 3.1-18.3 9.4" fill="#FFFFFF"/></svg>'
const SETTINGS_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.3137 7.34312C21.9232 6.95259 21.29 6.95259 20.8995 7.34312L18.071 10.1715L13.8284 5.92891L16.6568 3.10048C17.0474 2.70995 17.0474 2.07679 16.6568 1.68626C16.2663 1.29574 15.6331 1.29574 15.2426 1.68626L12.4142 4.51469L10.2929 2.39337L6.05023 6.63601C3.70708 8.97916 3.70708 12.7781 6.05023 15.1213L6.75734 15.8284L2.51469 20.071C2.12417 20.4616 2.12417 21.0947 2.51469 21.4853C2.90522 21.8758 3.53838 21.8758 3.92891 21.4853L8.17155 17.2426L8.87866 17.9497C11.2218 20.2929 15.0208 20.2929 17.3639 17.9497L21.6066 13.7071L19.4853 11.5858L22.3137 8.75733C22.7042 8.36681 22.7042 7.73364 22.3137 7.34312ZM7.46444 8.05023L10.2929 5.2218L18.7782 13.7071L15.9497 16.5355C14.3876 18.0976 11.855 18.0976 10.2929 16.5355L7.46444 13.7071C5.90235 12.145 5.90235 9.61232 7.46444 8.05023Z" fill="#050038"/></svg>'

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
        librarySvgIcon: CODEBEAMER_ICON,
        toolbarSvgIcon: CODEBEAMER_ICON,
        onClick: () => {
          getCodeBeamerUser()
            .then(() => miro.board.ui.openModal('picker.html'))
            .catch(err => {
              miro.showErrorNotification(`Please fix CB Connection settings. CB Connection could not be established: ${err}`)
              miro.board.ui.openModal('settings.html')
            })
        },
      },
      getWidgetMenuItems: function (selectedWidgets) {
        var menuItems: SDK.IWidgetMenuItem[] = []
        if (isSelectionConvertable(selectedWidgets))
          menuItems.push(
            {
              tooltip: "Convert to codeBeamer Item",
              svgIcon: UPLOAD_ICON,
              onClick: () => submitNewCodeBeamerItem(selectedWidgets[0]),
            })
        if (isSettingsWidgetSelected(selectedWidgets))
          menuItems.push(
            {
              tooltip: "Open CodeBeamer <-> Miro Settings",
              svgIcon: SETTINGS_ICON,
              onClick: () => {
                miro.board.ui.openModal('settings.html')
              },
            })
        // if (isSelectionOpenable(selectedWidgets))
        //   menuItems.push(
        //     {
        //       tooltip: "Open in CodeBeamer",
        //       svgIcon: OPEN_ITEM_ICON,
        //       onClick: () => openInCodeBeamer(selectedWidgets),
        //     })
        return Promise.resolve(menuItems);
      },
    }
  })
})

function isSettingsWidget(widget: SDK.IWidget) {
  return widget.metadata && widget.metadata[App.appId] && widget.metadata[App.appId].settings
}

function isSettingsWidgetSelected(selectedWidgets: SDK.IWidget[]) {
  return selectedWidgets.length === 1 && (isSettingsWidget(selectedWidgets[0]))
}

function isWidgetConvertable(widget: SDK.IWidget) {
  let supportedWidgetTypes = ['STICKER', 'CARD', 'TEXT', 'SHAPE']
  return (!widget.metadata || !widget.metadata[App.appId]) // only allow items NOT created by this plugin
    && supportedWidgetTypes.includes(widget.type) // only allow supported types
}

function isSelectionConvertable(selectedWidgets: SDK.IWidget[]) {
  // only single selection supported
  return selectedWidgets.length === 1 && (isWidgetConvertable(selectedWidgets[0]))
}