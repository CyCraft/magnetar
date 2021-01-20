import type firebase from 'firebase'
import {
  PluginFetchAction,
  FetchResponse,
  DocMetadata,
  PluginFetchActionPayload,
} from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { getFirestoreDocPath, getFirestoreCollectionPath } from '../helpers/pathHelpers'
import { getQueryInstance, docSnapshotToDocMetadata } from '../helpers/queryHelpers'

type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot

export function fetchActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginFetchAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<FirestoreModuleConfig>): Promise<FetchResponse> {
    const { firestoreInstance } = firestorePluginOptions
    // in case of a doc module
    let snapshots: (DocumentSnapshot | QueryDocumentSnapshot)[] | undefined
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const docSnapshot = await firestoreInstance.doc(documentPath).get()
      snapshots = [docSnapshot]
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, firestoreInstance)
      const querySnapshot = await queryInstance.get()
      snapshots = querySnapshot.docs
    }
    if (!snapshots) return { docs: [] }
    // map snapshots to DocMetadata type
    const docs: DocMetadata[] = snapshots.map(docSnapshotToDocMetadata)
    return { docs }
  }
}
