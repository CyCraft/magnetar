import { isFullString, isNumber } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function deleteActionFactory(
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeleteAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<FirestoreModuleConfig>): Promise<void> {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    const documentPath = getFirestoreDocPath(collectionPath, _docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    await batchSync.delete(documentPath, syncDebounceMs)
  }
}
