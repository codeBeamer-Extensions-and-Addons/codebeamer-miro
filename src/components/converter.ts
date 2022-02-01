import App from './app';
import { CardData } from "types/CardData"
import { getCodeBeamerItemURL, getCodeBeamerAssociationDetails, RELATION_OUT_ASSOCIATION_TYPE, RELATION_UPSTREAM_REF_TYPE } from './codebeamer';
import { Constants } from './constants';
import Store from './store'
import { UserMapping } from '../types/UserMapping';

export async function convert2Card(item): Promise<CardData> {
  let cardData: CardData = {
    type: 'CARD',
    title: `<a href="${getCodeBeamerItemURL(item.id)}">[${item.tracker.keyName}-${item.id}] - ${item.name}</a>`,
    description: item.renderedDescription,
    card: {
      logo: {
        iconUrl: `${(new URL(window.location.href)).origin}/img/codeBeamer-Logo-BW.png`
      },
      customFields: [
        {
          mainColor: '#4f8ae8',
          fontColor: '#ffffff',
          value: `Status: ${item.status.name}`,
        },
      ],
    },
    capabilities: {
      editable: false
    },
    metadata: {
      [App.appId]: {
        id: item.id,
      },
    },
  }

  // additional custom fields
  if (item.release) { cardData.card?.customFields?.push({ value: `Rel: ${item.release.name}` }) }
  if (item.storyPoints) { cardData.card?.customFields?.push({ value: `SP: ${item.storyPoints}` }) }

  delete cardData.assignee // so that it gets cleared if no value is set (but was previously set so is current on the card)
  if (item.assignedTo) {
    let mappedUser = item.assignedTo
      .map(assignedUser => assignedUser.id) // get cbUserID
      .map((cbId: string) => Store.getInstance().getUserMapping({ cbUserId: cbId })) // get mapping
      // take the first mapping that is found (some users in CB might not be defined. If multiple are, we only take the first as the field is single select in miro)
      .find((mapping: UserMapping | undefined) => !!mapping)

    if (mappedUser) {
      cardData.assignee = { userId: mappedUser.miroUserId }
    }
  }

  if(item.startDate) {
    let date = new Date(item.startDate).toLocaleDateString();
    let customField = {
      mainColor: '#393b3a',
      fontColor: '#fff',
      value: `Start: ${date}`
    }
    cardData.card?.customFields?.push(customField);
  }

  if(item.endDate) {
    let date = new Date(item.endDate).toLocaleDateString();
    let customField = {
      mainColor: '#393b3a',
      fontColor: '#fff',
      value: `End: ${date}`
    }
    cardData.card?.customFields?.push(customField);
  }

  // background Color
  let colorFieldValue = findColorFieldOnItem(item);
  let backgroundColor = colorFieldValue ? colorFieldValue
    : item.tracker.color ? item.tracker.color
      : null;
  if (backgroundColor) {
    cardData.style = { backgroundColor: backgroundColor };
  }

  if (item[Constants.NEWPOS]) {
    cardData.x = item[Constants.NEWPOS].x;
    cardData.y = item[Constants.NEWPOS].y;
  }

  return cardData;
}

function findColorFieldOnItem(item) {
  var colorField = item.customFields ? item.customFields.find(field => field.type === 'ColorFieldValue') : null
  return colorField ? colorField.value : null
}

async function lineStyleByRelationType(relation) {

  let style: any = {
    lineType: miro.enums.lineType.ARROW,
    lineStyle: miro.enums.lineStyle.NORMAL,
    lineEndStyle: miro.enums.lineArrowheadStyle.ARC_ARROW,
    lineStartStyle: miro.enums.lineArrowheadStyle.NONE,
    lineThickness: 1,
  }
  
  if (relation.type === RELATION_OUT_ASSOCIATION_TYPE) {
    let associationDetails = await getCodeBeamerAssociationDetails(relation)
    switch (associationDetails.type.id) {
      case 1: // depends
        style.lineColor = '#cf7f30' // orange
        style.lineEndStyle = miro.enums.lineArrowheadStyle.ARROW
        style.lineThickness = 5
        break;
      case 4: // related
      case 9: // copy of
        style.lineColor = '#21cfb7' // turquise
        style.lineStyle = miro.enums.lineStyle.DASHED
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
  } else if (relation.type === RELATION_UPSTREAM_REF_TYPE) {
    style.lineThickness = 3
  }

  return style
}

export async function convert2Line(relation, fromCardId, toCardId) {
  return {
    type: 'LINE',
    startWidgetId: fromCardId,
    endWidgetId: toCardId,
    style: await lineStyleByRelationType(relation),
    capabilities: {
      editable: false
    },
    metadata: {
      [App.appId]: {
        id: relation.id,
      },
    },
  }
}

function strip(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent;
}

/**
 * Converts a Miro widget to a CbItem
 * @param widget Miro widget in question
 * @returns CbItem based on given Miro widget
 */
export function convert2CbItem(widget): CreateCbItem {
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
      throw new Error(`Widget type '${widget.type}' not supported`)
  }
  return item
}

/**
 * Interface defining structure of a CbItem on creation.
 */
export interface CreateCbItem {
  name: string;
  description: string;
}