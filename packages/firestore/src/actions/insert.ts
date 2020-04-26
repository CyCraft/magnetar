import { PlainObject, PluginInsertAction, getCollectionPathDocIdEntry } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { throwIfInvalidFirestorePath } from '../helpers/throwFns'
import { BatchSync } from '../helpers/batchSync'
import { getFirestorePath } from '../helpers/pathHelpers'

export function insertActionFactory (
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginInsertAction {
  return async function (
    payload: PlainObject,
    modulePath: string,
    firestoreModuleConfig: FirestoreModuleConfig
  ): Promise<string> {
    const { firestoreInstance } = firestorePluginOptions
    const firestorePath = getFirestorePath(modulePath, firestoreModuleConfig, firestorePluginOptions) // prettier-ignore
    console.log(
      `modulePath, firestoreModuleConfig, firestorePluginOptions → `,
      modulePath,
      firestoreModuleConfig,
      { ...firestorePluginOptions, firestoreInstance: null }
    )
    console.log(`firestorePath → `, firestorePath)
    throwIfInvalidFirestorePath(firestorePath)
    const [collectionPath, _docId] = getCollectionPathDocIdEntry(firestorePath)
    let docId = _docId
    if (!docId) {
      // we don't have a docId, so we need to retrieve it from the payload or generate one
      docId =
        isFullString(payload.id) || isNumber(payload.id)
          ? String(payload.id)
          : firestoreInstance.collection(firestorePath).doc().id
    }
    const documentPath = `${collectionPath}/${docId}`
    await batchSync.set(documentPath, payload)
    return docId
  }
}
