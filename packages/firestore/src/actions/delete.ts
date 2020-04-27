import { PluginDeleteAction } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function deleteActionFactory (
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeleteAction {
  return async function (
    payload: undefined,
    [collectionPath, docId]: [string, string | undefined],
    firestoreModuleConfig: FirestoreModuleConfig
  ): Promise<void> {
    const documentPath = getFirestoreDocPath([collectionPath, docId], firestoreModuleConfig, firestorePluginOptions) // prettier-ignore
    await batchSync.delete(documentPath)
  }
}
