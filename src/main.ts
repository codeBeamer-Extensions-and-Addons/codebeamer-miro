import { convert2Line } from './components/converter';
import { createOrUpdateWidget, deleteWidget, findLinesByFromCard, findWidgetByTypeAndMetadataId } from './components/miro';
import { createOrUpdateCbItem, getCodeBeamerCbqlResult, getCodeBeamerOutgoingAssociations, getCodeBeamerAssociationDetails } from './components/codebeamer';
import App from './components/app';

export function syncWithCodeBeamer(itemIds : string[]) {
  return getCodeBeamerCbqlResult(`item.id IN (${itemIds.join(',')})`)
    .then(async queryResult => queryResult.items)
    .then(async cbItems => {
      console.log('starting createOrUpdateCbItem for all Items')
      for (let index = 0; index < cbItems.length; index++) {
        await createOrUpdateCbItem(cbItems[index])
      }
      console.log('starting createUpdateOrDeleteAssociationLines for all Items')
      for (let index = 0; index < cbItems.length; index++) {
        await createUpdateOrDeleteAssociationLines(cbItems[index])
      }
    })
}

async function createUpdateOrDeleteAssociationLines(cbItem) {
  let associations = await getCodeBeamerOutgoingAssociations(cbItem)
  const existingLines = await findLinesByFromCard(cbItem.card.id)

  // delete codebeamer-flagged lines which are no longer present in codebeamer that originate on any of the items synched above
  let deletionTask = Promise.all(
    existingLines.map(
      async line => {
        if (!associations.find(association => line.metadata[App.appId].id === association.id)) {
          console.log(`deleting line ${line.id} because the association ${line.metadata[App.appId].id} does not exist anymore`)
          await deleteWidget(line)
        }
      }
    )
  )

  // add or update lines from codeBeamer
  let additionTask = Promise.all(
    associations.map(
      async association => {
        const toCard = await findWidgetByTypeAndMetadataId({ type: 'CARD', metadata: { [App.appId]: { id: association.itemRevision.id } } });
        console.log(`Association ${association.id}: card for codeBeamer ID ${association.itemRevision.id} is: ${toCard ? toCard.id : 'NOT FOUND (item not synced)'}`)
        if (toCard) {
          let associationDetails = await getCodeBeamerAssociationDetails(association)
          await createOrUpdateWidget(convert2Line(associationDetails, cbItem.card.id, toCard.id))
        }
      }
    )
  )

  await Promise.all([deletionTask, additionTask])
}

