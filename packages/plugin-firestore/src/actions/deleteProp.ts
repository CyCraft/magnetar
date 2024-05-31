import type {
  PluginDeletePropAction,
  PluginDeletePropActionPayload,
  SyncBatch,
} from '@magnetarjs/types'
import {
  BatchSync,
  batchSyncFactory,
  FirestoreModuleConfig,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import { mapGetOrSet } from 'getorset-anything'
import { isArray, isNumber } from 'is-what'
import { BatchSyncMap, FirestorePluginOptions } from '../CreatePlugin.js'
import { applySyncBatch, createWriteBatch } from '../helpers/batchHelpers.js'

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

    const batchSync = mapGetOrSet(
      batchSyncMap,
      collectionPath,
      (): BatchSync => batchSyncFactory(firestorePluginOptions, createWriteBatch, applySyncBatch)
    )

    const result = await batchSync.deleteProp(documentPath, payloadArray, syncDebounceMs)
    return result
  }
}
