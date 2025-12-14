import type { PluginWriteAction } from '@magnetarjs/types'
import { BatchSync, batchSyncFactory, getFirestoreDocPath } from '@magnetarjs/utils-firestore'
import { mapGetOrSet } from 'getorset-anything'
import { isNumber } from 'is-what'
import { BatchSyncMap, FirestoreAdminPluginOptions } from '../CreatePlugin.js'
import { applySyncBatch, createWriteBatch } from '../helpers/batchHelpers.js'

export function writeActionFactory(
  batchSyncMap: BatchSyncMap,
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>,
  actionName: 'merge' | 'assign' | 'replace',
): PluginWriteAction {
  const write: PluginWriteAction = async ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }) => {
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig['syncDebounceMs']

    const batchSync = mapGetOrSet(
      batchSyncMap,
      collectionPath,
      (): BatchSync => batchSyncFactory(firestorePluginOptions, createWriteBatch, applySyncBatch),
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
  return write
}
