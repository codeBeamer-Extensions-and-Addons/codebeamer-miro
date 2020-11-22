const UPLOAD_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 20C16 19.4477 16.4477 19 17 19H20V4H4V19H7C7.55228 19 8 19.4477 8 20C8 20.5523 7.55228 21 7 21H3C2.44772 21 2 20.5523 2 20V3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44771 22 3V20C22 20.5523 21.5523 21 21 21H17C16.4477 21 16 20.5523 16 20Z" fill="#050038"/><path d="M11 21.5V11.9142L9.41421 13.5C9.02369 13.8905 8.39052 13.8905 8 13.5C7.60948 13.1095 7.60948 12.4763 8 12.0858L12 8.08579L16 12.0858C16.3905 12.4763 16.3905 13.1095 16 13.5C15.6095 13.8905 14.9763 13.8905 14.5858 13.5L13 11.9142V21.5C13 22.0523 12.5523 22.5 12 22.5C11.4477 22.5 11 22.0523 11 21.5Z" fill="#050038"/></svg>'
const OPEN_ITEM_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5V17H20V14C20 13.4477 20.4477 13 21 13C21.5523 13 22 13.4477 22 14V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V5C2 3.89543 2.89543 3 4 3H11C11.5523 3 12 3.44772 12 4C12 4.55228 11.5523 5 11 5H4Z" fill="#050038"/><path d="M20.0093 6.40496L20 8.99643C19.998 9.54871 20.4442 9.99802 20.9964 9.99999C21.5487 10.002 21.998 9.55585 22 9.00357L22.0214 3H16C15.4477 3 15 3.44772 15 4C15 4.55228 15.4477 5 16 5H18.5858L12.2929 11.2929C11.9024 11.6834 11.9024 12.3166 12.2929 12.7071C12.6834 13.0976 13.3166 13.0976 13.7071 12.7071L20.0093 6.40496Z" fill="#050038"/><path d="M6 21C6 20.4477 6.44772 20 7 20H17C17.5523 20 18 20.4477 18 21C18 21.5523 17.5523 22 17 22H7C6.44771 22 6 21.5523 6 21Z" fill="#050038"/></svg>'
const CODEBEAMER_ICON = '<<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="95.000000pt" height="95.000000pt" viewBox="0 0 95.000000 95.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,95.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M410 929 c-203 -23 -362 -178 -395 -384 -39 -247 132 -486 378 -526 67 -12 171 -5 215 13 73 29 94 41 142 77 186 140 235 392 117 600 -25 44 -143 161 -163 161 -7 0 -14 4 -14 8 0 13 -120 50 -175 54 -27 2 -75 0 -105 -3z m234 -84 c79 -36 154 -113 197 -200 32 -66 33 -76 33 -175 0 -98 -3 -110 -33 -172 -80 -164 -265 -261 -437 -229 -334 61 -460 463 -219 696 51 50 121 91 179 106 17 5 74 7 126 5 78 -3 105 -8 154 -31z"/><path d="M482 753 c-11 -10 -29 -23 -39 -29 -17 -11 -17 -13 0 -42 22 -39 23 -38 -18 -57 -68 -33 -106 -86 -120 -172 -7 -42 -7 -42 -30 -27 -22 14 -25 14 -42 -4 -52 -55 -62 -83 -30 -88 13 -2 16 2 12 16 -4 13 1 22 15 30 26 14 51 1 87 -48 70 -97 121 -130 208 -139 62 -7 116 9 150 43 31 31 33 45 3 16 -68 -63 -176 -54 -256 23 l-46 43 30 25 c16 15 36 27 45 27 19 0 43 -25 36 -37 -3 -4 1 -14 9 -21 12 -11 14 -8 14 18 0 16 -3 30 -8 30 -4 0 -13 14 -20 30 -15 34 -45 40 -73 14 -43 -39 -22 35 25 86 13 14 26 34 30 45 7 18 10 16 22 -16 18 -42 58 -69 76 -51 9 9 8 12 -4 12 -8 0 -20 6 -26 13 -40 48 -7 113 52 101 37 -6 79 11 110 45 21 23 13 37 -37 59 -49 21 -98 15 -123 -15 -19 -23 -26 -26 -41 -17 -27 17 -30 64 -4 71 12 3 21 12 21 19 0 18 -3 18 -28 -3z"/><path d="M610 504 c0 -8 5 -12 10 -9 6 3 10 10 10 16 0 5 -4 9 -10 9 -5 0 -10 -7 -10 -16z"/></g></svg>'

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'CodeBeamer Sync',
        svgIcon: CODEBEAMER_ICON,
        onClick: syncWithCodeBeamer,
      },
      toolbar: {
        title: "codeBeamer<->Miro Settings",
        librarySvgIcon: CODEBEAMER_ICON,
        toolbarSvgIcon: CODEBEAMER_ICON,
        onClick: async () => {
          let returnval = await miro.board.ui.openModal('src/settings.html')
          console.log(JSON.stringify(returnval))
        },
      },
      getWidgetMenuItems: function (selectedWidgets) {
        var menuItems = []
        if (isSelectionConvertable(selectedWidgets))
          menuItems.push(
            {
              tooltip: "Convert to codeBeamer Item",
              svgIcon: UPLOAD_ICON,
              onClick: () => submitNewCodeBeamerItem(selectedWidgets[0]),
            })
        // if (isSelectionOpenable(selectedWidgets))
        //   menuItems.push(
        //     {
        //       tooltip: "Open in CodeBeamer",
        //       svgIcon: OPEN_ITEM_ICON,
        //       onClick: () => openInCodeBeamer(selectedWidgets),
        //     })
        return menuItems
      },
    }
  })
  onAllWidgetsLoaded(async () => {
    let settingsWidget = await CreateOrHideSettingsWidget()
    console.log(`codebeamer-miro settings are now hidden: ${settingsWidget.id}`)
  })
})