import type {
  DocMetadata,
  FetchResponse,
  PluginFetchAction,
  PluginFetchActionPayload,
} from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreCollectionPath,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { isString } from 'is-what'
import { FirestoreAdminPluginOptions } from '../CreatePlugin.js'
import { docSnapshotToDocMetadata, getQueryInstance } from '../helpers/getFirestore.js'

export function fetchActionFactory(
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>,
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
    if (isString(docId)) {
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
    if (!snapshots) return { docs: [], reachedEnd: true, cursor: undefined }

    const { limit } = pluginModuleConfig
    const reachedEnd = docId || limit === undefined ? true : snapshots.length < limit
    /** @see https://firebase.google.com/docs/firestore/query-data/query-cursors */
    const cursor = snapshots[snapshots.length - 1]

    // map snapshots to DocMetadata type
    const docs: DocMetadata[] = snapshots.map(docSnapshotToDocMetadata)

    return { docs, reachedEnd, cursor }
  }
}
