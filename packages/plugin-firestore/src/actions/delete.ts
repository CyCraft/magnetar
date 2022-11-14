import { isFullString, isNumber } from 'is-what'
import { mapGetOrSet } from 'getorset-anything'
import { PluginDeleteAction, PluginDeleteActionPayload, SyncBatch } from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreDocPath,
  batchSyncFactory,
  BatchSync,
} from '@magnetarjs/utils-firestore'
import { BatchSyncMap, FirestorePluginOptions } from '../CreatePlugin'
import { createWriteBatch, applySyncBatch } from '../helpers/batchHelpers'

export function deleteActionFactory(
  batchSyncMap: BatchSyncMap,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeleteAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<FirestoreModuleConfig>): Promise<SyncBatch> {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    const documentPath = getFirestoreDocPath(collectionPath, _docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    const batchSync = mapGetOrSet(
      batchSyncMap,
      collectionPath,
      (): BatchSync => batchSyncFactory(firestorePluginOptions, createWriteBatch, applySyncBatch)
    )

    const result = await batchSync.delete(documentPath, syncDebounceMs)
    return result
  }
}
