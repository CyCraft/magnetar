import { isArray, isNumber } from 'is-what'
import { PluginDeletePropAction, PluginDeletePropActionPayload, SyncBatch } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function deletePropActionFactory(
  batchSync: BatchSync,
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

    const result = await batchSync.deleteProp(documentPath, payloadArray, syncDebounceMs)
    return result
  }
}
