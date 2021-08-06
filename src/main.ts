import { convert2Line } from './components/converter';
import { createOrUpdateWidget, deleteWidget, findLinesByFromCard, findWidgetByTypeAndMetadataId } from './components/miro';
import { createOrUpdateCbItem, getCodeBeamerCbqlResult, getCodeBeamerOutgoingRelations, getCodeBeamerAssociationDetails } from './components/codebeamer';
import App from './components/app';

export function syncWithCodeBeamer(itemIds : string[]) {
  return getCodeBeamerCbqlResult(`item.id IN (${itemIds.join(',')})`)
    .then(async queryResult => queryResult.items)
    .then(async cbItems => {
      console.log('starting createOrUpdateCbItem for all Items')
      for (let cbItem of cbItems) {
        await createOrUpdateCbItem(cbItem)
      }
      console.log('starting createUpdateOrDeleteRelationLines for all Items')
      for (let cbItem of cbItems) {
        await createUpdateOrDeleteRelationLines(cbItem)
      }
    })
}

async function createUpdateOrDeleteRelationLines(cbItem) {
  let relations = await getCodeBeamerOutgoingRelations(cbItem)
  const existingLines = await findLinesByFromCard(cbItem.card.id)

  // delete codebeamer-flagged lines which are no longer present in codebeamer that originate on any of the items synched above
  let deletionTask = Promise.all(
    existingLines.map(
      async line => {
        if (!relations.find(relation => line.metadata[App.appId].id === relation.id)) {
          console.log(`deleting line ${line.id} because the relation ${line.metadata[App.appId].id} does not exist anymore`)
          await deleteWidget(line)
        }
      }
    )
  )

  // add or update lines from codeBeamer
  let additionTask = Promise.all(
    relations.map(
      async relation => {
        const toCard = await findWidgetByTypeAndMetadataId({ type: 'CARD', metadata: { [App.appId]: { id: relation.itemRevision.id } } });
        console.log(`Association ${relation.id}: card for codeBeamer ID ${relation.itemRevision.id} is: ${toCard ? toCard.id : 'NOT FOUND (item not synced)'}`)
        if (toCard) {
          await createOrUpdateWidget(await convert2Line(relation, cbItem.card.id, toCard.id))
        }
      }
    )
  )

  await Promise.all([deletionTask, additionTask])
}

