import Store from 'components/store';
import { convert2Line } from 'components/converter';
import { createOrUpdateWidget, deleteWidget, findLinesByFromCard, findWidgetByTypeAndMetadataId } from 'components/miro';
import { createOrUpdateCbItem, getCodeBeamerItems, getCodeBeamerOutgoingAssociations, getCodeBeamerAssociationDetails } from 'components/codebeamer';

const store = Store.getInstance();

miro.onReady(() => {
  store.state.appId = miro.getClientId()
  store.state.onReadyCalled = true
  while (store.state.onReadyFuncs.length) { store.state.onReadyFuncs.shift().call() }
})

export function onReady(func) {
  if (store.state.onReadyCalled) {
    func()
  } else {
    store.state.onReadyFuncs.push(func)
  }
}

export async function onAllWidgetsLoaded(callback) {
  const areAllWidgetsLoaded = await miro.board.widgets.areAllWidgetsLoaded()
  if (areAllWidgetsLoaded) {
    callback()
  } else {
    miro.addListener('ALL_WIDGETS_LOADED', callback)
  }
}

// function isSelectionOpenable(selectedWidgets) {
//   // only single selection supported
//   return !selectedWidgets.some(widget => !isWidgetRepresentingCodeBeamerItem(widget))
// }

// function isWidgetRepresentingCodeBeamerItem(widget) {
//   return widget.metadata && widget.metadata[appId] && widget.metadata[appId].id
// }


// async function openInCodeBeamer(selectedWidgets) {
//   await Promise.all(
//     selectedWidgets.map(async widget => {
//       await window.open(await getCodeBeamerItemURL(widget.metadata[appId].id), '_blank')
//     })
//   )
// }

export async function syncWithCodeBeamer() {
  await getCodeBeamerItems()
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
  miro.showNotification('Sync with codeBeamer finished!')
}

async function createUpdateOrDeleteAssociationLines(cbItem) {
  let associations = await getCodeBeamerOutgoingAssociations(cbItem)
  const existingLines = await findLinesByFromCard(cbItem.card.id)

  // delete lines which are no longer present that originate on any of the items synched above
  let deletionTask = Promise.all(
    existingLines.map(
      async line => {
        if (!associations.find(association => line.metadata[store.state.appId].id === association.id)) {
          console.log(`deleting line ${line.id} because the association ${line.metadata[store.state.appId].id} does not exist anymore`)
          await deleteWidget(line)
        }
      }
    )
  )

  // add or update lines
  let additionTask = Promise.all(
    associations.map(
      async association => {
        const toCard = await findWidgetByTypeAndMetadataId({ type: 'CARD', metadata: { [store.state.appId]: { id: association.itemRevision.id } } });
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

