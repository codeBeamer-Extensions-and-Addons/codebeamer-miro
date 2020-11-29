import Store from './store';
import { CardData } from "types/CardData"
import { getCodeBeamerItemURL } from './codebeamer';

const store = Store.getInstance();
const appId = store.state.appId;

export async function convert2Card(item) {
  let cardData: CardData = {
    type: 'CARD',
    title: `<a href="${await getCodeBeamerItemURL(item.id)}">[${item.tracker.keyName}-${item.id}] - ${item.name}</a>`,
    description: item.renderedDescription,
    card: {
      logo: {
        iconUrl: `${window.location.href}src/img/codeBeamer-Logo-BW.png`
      },
      customFields: [
        {
          mainColor: '#4f8ae8',
          fontColor: '#ffffff',
          value: `Status: ${item.status.name}`,
        }, {
          value: `Release: ${item.release ? item.release.name : '--'}`
        },
      ],
    },
    capabilities: {
      editable: false
    },
    metadata: {
      [appId]: {
        id: item.id,
      },
    },
  };

  // background Color
  let colorFieldValue = findColorFieldOnItem(item);
  let backgroundColor = colorFieldValue ? colorFieldValue
    : item.tracker.color ? item.tracker.color
      : null;
  if (backgroundColor) {
    cardData.style = { backgroundColor: backgroundColor };
  }

  if (item[store.state.NEWPOS]) {
    cardData.x = item[store.state.NEWPOS].x;
    cardData.y = item[store.state.NEWPOS].y;
  }

  return cardData;
}

function findColorFieldOnItem(item) {
  var colorField = item.customFields ? item.customFields.find(field => field.type === 'ColorFieldValue') : null
  return colorField ? colorField.value : null
}

function lineStyleByAssociationType(associationDetails) {
  
  let style: any = {
    lineType: 2, // ARROW: = 2, ARROW_SKETCH: = 9, LINE: = 1
    lineStyle: 2, // DASHED = 1, NORMAL = 2, STRONG = 3, DOTTED = 4
    lineEndStyle: 1, // ARC_ARROW: = 1, ARROW: = 6, CIRCLE: = 4, FILLED_ARROW: = 8, FILLED_CIRCLE: = 5, FILLED_RHOMBUS: = 3, NONE: = 0, OPEN_ARROW: = 7, RHOMBUS: = 2
    lineStartStyle: 0, // see above
    lineThickness: 1,
  }

  switch (associationDetails.type.id) {
    case 1: // depends
      style.lineColor = '#cf7f30' // orange
      style.lineEndStyle = 6
      style.lineThickness = 5
      break;
    case 4: // related
    case 9: // copy of
      style.lineColor = '#21cfb7' // turquise
      style.lineStyle = 1
      style.lineStartStyle = 1
      break;
    case 6: // violates
    case 8: // invalidates
    case 7: // excludes
      style.lineColor = '#b32525' // red
      break;
    case 2: // parent
    case 3: // child
    case 5: // derived
    default:
    // leave default
  }
  return style
}

export function convert2Line(associationDetails, fromCardId, toCardId) {
  let lineData = {
    type: 'LINE',
    startWidgetId: fromCardId,
    endWidgetId: toCardId,
    style: lineStyleByAssociationType(associationDetails),
    capabilities: {
      editable: false
    },
    metadata: {
      [appId]: {
        id: associationDetails.id,
      },
    },
  }
  return lineData
}

function strip(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent;
}

export function convert2CbItem(widget) {
  let item = {
    name: "New Item",
    description: "--"
  }
  switch (widget.type) {
    case 'CARD':
      const nameNoHtml = strip(widget.title)
      if (nameNoHtml)
        item.name = nameNoHtml
      if (widget.description)
        item.description = widget.description
      break;
    case 'SHAPE':
    case 'STICKER':
      if (widget.plainText)
        item.name = widget.plainText
      break;
    case 'TEXT':
      if (widget.text)
        item.name = widget.text
      break;
    default:
      throw `Widget type '${widget.type}' not supported`
  }
  return item
}