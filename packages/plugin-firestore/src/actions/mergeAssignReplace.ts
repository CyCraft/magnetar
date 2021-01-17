import { PluginWriteAction, PluginWriteActionPayload } from '@magnetarjs/core'
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
    pluginModuleConfig,
  }: PluginWriteActionPayload<FirestoreModuleConfig>): Promise<void> {
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    await batchSync.set(documentPath, payload, actionName)
  }
}
