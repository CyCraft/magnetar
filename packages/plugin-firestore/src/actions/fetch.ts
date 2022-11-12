import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { doc, getDoc, getDocs } from 'firebase/firestore'
import {
  PluginFetchAction,
  FetchResponse,
  DocMetadata,
  PluginFetchActionPayload,
} from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreDocPath,
  getFirestoreCollectionPath,
} from '@magnetarjs/utils-firestore'
import { getQueryInstance, docSnapshotToDocMetadata } from '../helpers/getFirestore'
import { FirestorePluginOptions } from '../CreatePlugin'

export function fetchActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
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
      const docSnapshot = await getDoc(doc(db, documentPath))
      snapshots = [docSnapshot]
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)
      const querySnapshot = await getDocs(queryInstance)
      snapshots = querySnapshot.docs
    }

    if (!snapshots) return { docs: [], reachedEnd: true, last: undefined }

    const { limit } = pluginModuleConfig
    const reachedEnd = docId || limit === undefined ? true : snapshots.length < limit
    /** @see https://firebase.google.com/docs/firestore/query-data/query-cursors */
    const last = snapshots[snapshots.length - 1]

    // map snapshots to DocMetadata type
    const docs: DocMetadata[] = snapshots.map(docSnapshotToDocMetadata)

    return { docs, reachedEnd, last }
  }
}
