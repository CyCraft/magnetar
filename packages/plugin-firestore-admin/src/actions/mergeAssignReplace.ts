import { isNumber } from 'is-what'
import { mapGetOrSet } from 'getorset-anything'
import { PluginWriteAction, PluginWriteActionPayload, SyncBatch } from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreDocPath,
  batchSyncFactory,
} from '@magnetarjs/utils-firestore'
import { BatchSyncMap, FirestoreAdminPluginOptions } from '../CreatePlugin'
import { createWriteBatch, applySyncBatch } from '../helpers/batchHelpers'

export function writeActionFactory(
  batchSyncMap: BatchSyncMap,
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>,
  actionName: 'merge' | 'assign' | 'replace'
): PluginWriteAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginWriteActionPayload<FirestoreModuleConfig>): Promise<SyncBatch> {
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    const batchSync = mapGetOrSet(batchSyncMap, collectionPath, () =>
      batchSyncFactory(firestorePluginOptions, createWriteBatch, applySyncBatch)
    )

    if (actionName === 'assign') {
      const result = await batchSync.assign(documentPath, payload, syncDebounceMs)
      return result
    }
    if (actionName === 'replace') {
      const result = await batchSync.replace(documentPath, payload, syncDebounceMs)
      return result
    }
    // (actionName === 'merge')
    const result = await batchSync.merge(documentPath, payload, syncDebounceMs)
    return result
  }
}