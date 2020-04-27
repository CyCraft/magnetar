import { PlainObject, PluginInsertAction } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function insertActionFactory (
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginInsertAction {
  return async function (
    payload: PlainObject,
    [collectionPath, _docId]: [string, string | undefined],
    firestoreModuleConfig: FirestoreModuleConfig
  ): Promise<string> {
    const { firestoreInstance } = firestorePluginOptions
    let docId = _docId
    if (!docId) {
      // we don't have a docId, so we need to retrieve it from the payload or generate one
      docId =
        isFullString(payload.id) || isNumber(payload.id)
          ? String(payload.id)
          : firestoreInstance.collection('random').doc().id
    }
    const documentPath = getFirestoreDocPath([collectionPath, docId], firestoreModuleConfig, firestorePluginOptions) // prettier-ignore
    await batchSync.set(documentPath, payload)
    return docId
  }
}
