import { PluginInsertAction, PluginInsertActionPayload, SyncBatch } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function insertActionFactory(
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginInsertAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginInsertActionPayload<FirestoreModuleConfig>): Promise<[string, SyncBatch]> {
    const { firebaseInstance } = firestorePluginOptions
    let _docId = docId
    if (!_docId) {
      // we don't have a _docId, so we need to retrieve it from the payload or generate one
      _docId =
        isFullString(payload.id) || isNumber(payload.id)
          ? String(payload.id)
          : firebaseInstance.firestore().collection('random').doc().id
    }
    const documentPath = getFirestoreDocPath(collectionPath, _docId as string, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    const result = await batchSync.insert(documentPath, payload, syncDebounceMs)
    return [_docId as string, result]
  }
}
