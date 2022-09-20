import { isArray, isNumber } from 'is-what'
import { mapGetOrSet } from 'getorset-anything'
import { PluginDeletePropAction, PluginDeletePropActionPayload, SyncBatch } from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreDocPath,
  batchSyncFactory,
} from '@magnetarjs/utils-firestore'
import { BatchSyncMap, FirestorePluginOptions } from '../CreatePlugin'
import { createWriteBatch, applySyncBatch } from '../helpers/batchHelpers'

export function deletePropActionFactory(
  batchSyncMap: BatchSyncMap,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeletePropAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<FirestoreModuleConfig>): Promise<SyncBatch> {
    if (!docId) throw new Error('An non-existent action was triggered on a collection')
    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const payloadArray = isArray(payload) ? payload : [payload]
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    const batchSync = mapGetOrSet(batchSyncMap, collectionPath, () =>
      batchSyncFactory(firestorePluginOptions, createWriteBatch, applySyncBatch)
    )

    const result = await batchSync.deleteProp(documentPath, payloadArray, syncDebounceMs)
    return result
  }
}
