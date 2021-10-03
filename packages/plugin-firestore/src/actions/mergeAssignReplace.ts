import { isNumber } from 'is-what'
import { PluginWriteAction, PluginWriteActionPayload, SyncBatch } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function writeActionFactory(
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>,
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
