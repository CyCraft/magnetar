import { firestore } from 'firebase'
import { PluginGetAction, GetResponse, DocMetadata, PluginGetActionPayload } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { getFirestoreDocPath, getFirestoreCollectionPath } from '../helpers/pathHelpers'
import { getQueryInstance, docSnapshotToDocMetadata } from 'src/helpers/queryHelpers'

type DocumentSnapshot = firestore.DocumentSnapshot
type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot

export function getActionFactory (
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginGetAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginGetActionPayload<FirestoreModuleConfig>): Promise<GetResponse> {
    const { firestoreInstance } = firestorePluginOptions
    // in case of a doc module
    let snapshots: (DocumentSnapshot | QueryDocumentSnapshot)[]
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
    // map snapshots to DocMetadata type
    const docs: DocMetadata[] = snapshots.map(docSnapshotToDocMetadata)
    return { docs }
  }
}
