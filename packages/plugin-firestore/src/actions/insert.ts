import type { PluginInsertAction, PluginInsertActionPayload, SyncBatch } from '@magnetarjs/types'
import {
  BatchSync,
  FirestoreModuleConfig,
  batchSyncFactory,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import { collection, doc } from 'firebase/firestore'
import { mapGetOrSet } from 'getorset-anything'
import { isFullString, isNumber } from 'is-what'
import { BatchSyncMap, FirestorePluginOptions } from '../CreatePlugin.js'
import { applySyncBatch, createWriteBatch } from '../helpers/batchHelpers.js'

export function insertActionFactory(
  batchSyncMap: BatchSyncMap,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginInsertAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginInsertActionPayload<FirestoreModuleConfig>): Promise<[string, SyncBatch]> {
    const { db } = firestorePluginOptions
    let _docId = docId
    if (!_docId) {
      // we don't have a _docId, so we need to retrieve it from the payload or generate one
      _docId =
        isFullString(payload['id']) || isNumber(payload['id'])
          ? String(payload['id'])
          : doc(collection(db, 'random')).id
    }
    const documentPath = getFirestoreDocPath(collectionPath, _docId as string, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    const batchSync = mapGetOrSet(
      batchSyncMap,
      collectionPath,
      (): BatchSync => batchSyncFactory(firestorePluginOptions, createWriteBatch, applySyncBatch)
    )

    const result = await batchSync.insert(documentPath, payload, syncDebounceMs)
    return [_docId as string, result]
  }
}
