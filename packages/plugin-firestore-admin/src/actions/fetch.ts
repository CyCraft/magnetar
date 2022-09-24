import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import {
  PluginFetchAction,
  FetchResponse,
  DocMetadata,
  PluginFetchActionPayload,
} from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreCollectionPath,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import { getQueryInstance, docSnapshotToDocMetadata } from '../helpers/getFirestore'
import { FirestoreAdminPluginOptions } from '../CreatePlugin'

export function fetchActionFactory(
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>
): PluginFetchAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<FirestoreModuleConfig>): Promise<FetchResponse> {
    const { db } = firestorePluginOptions
    // in case of a doc module
    let snapshots: (DocumentSnapshot | QueryDocumentSnapshot)[] | undefined
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const docSnapshot = await db.doc(documentPath).get()
      snapshots = [docSnapshot]
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)
      const querySnapshot = await queryInstance.get()
      snapshots = querySnapshot.docs
    }
    if (!snapshots) return { docs: [] }
    // map snapshots to DocMetadata type
    const docs: DocMetadata[] = snapshots.map(docSnapshotToDocMetadata)
    return { docs }
  }
}