// TODO: update to v9 modular
// import type firebase from 'firebase'
import {
  PluginFetchAction,
  FetchResponse,
  DocMetadata,
  PluginFetchActionPayload,
} from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { getFirestoreDocPath, getFirestoreCollectionPath } from '../helpers/pathHelpers'
import { getQueryInstance, docSnapshotToDocMetadata } from '../helpers/queryHelpers'

// TODO: update to v9 modular
// type DocumentSnapshot = firebase.firestore.DocumentSnapshot
// type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot
type DocumentSnapshot = any
type QueryDocumentSnapshot = any

export function fetchActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginFetchAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<FirestoreModuleConfig>): Promise<FetchResponse> {
    const { firebaseInstance } = firestorePluginOptions
    // in case of a doc module
    let snapshots: (DocumentSnapshot | QueryDocumentSnapshot)[] | undefined
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const docSnapshot = await firebaseInstance.firestore().doc(documentPath).get()
      snapshots = [docSnapshot]
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(
        _collectionPath,
        pluginModuleConfig,
        firebaseInstance.firestore()
      )
      const querySnapshot = await queryInstance.get()
      snapshots = querySnapshot.docs
    }
    if (!snapshots) return { docs: [] }
    // map snapshots to DocMetadata type
    const docs: DocMetadata[] = snapshots.map(docSnapshotToDocMetadata)
    return { docs }
  }
}
