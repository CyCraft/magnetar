import { PluginWriteAction, PluginWriteActionPayload } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function writeActionFactory (
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>,
  actionName: 'merge' | 'assign' | 'replace'
): PluginWriteAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginWriteActionPayload<FirestoreModuleConfig>): Promise<void> {
    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    if (actionName === 'merge') {
      await batchSync.set(documentPath, payload, { merge: true })
    }
    if (actionName === 'assign') {
      await batchSync.set(documentPath, payload, { mergeFields: Object.keys(payload) })
    }
    if (actionName === 'replace') {
      await batchSync.set(documentPath, payload)
    }
  }
}
