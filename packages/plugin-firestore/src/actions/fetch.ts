import type {
  DocMetadata,
  FetchResponse,
  PluginFetchAction,
  PluginFetchActionPayload,
} from '@magnetarjs/types'
import { logWithFlair } from '@magnetarjs/utils'
import {
  FirestoreModuleConfig,
  getFirestoreCollectionPath,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { doc, getDoc, getDocs } from 'firebase/firestore'
import { FirestorePluginOptions } from '../CreatePlugin.js'
import { docSnapshotToDocMetadata, getQueryInstance } from '../helpers/getFirestore.js'

export function fetchActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginFetchAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<FirestoreModuleConfig>): Promise<FetchResponse> {
    const { db, debug } = firestorePluginOptions
    // in case of a doc module
    let snapshots: (DocumentSnapshot | QueryDocumentSnapshot)[] | undefined
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const query = doc(db, documentPath)
      const warnNoResponse = debug
        ? setTimeout(() => logWithFlair(`no response after 5 seconds on \`await getDocs(query)\``, 'query:', query), 5_000) // prettier-ignore
        : undefined
      const docSnapshot = await getDoc(query)
      clearTimeout(warnNoResponse)
      snapshots = [docSnapshot]
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

      const query = getQueryInstance(_collectionPath, pluginModuleConfig, db, debug)
      const warnNoResponse = debug
        ? setTimeout(() => logWithFlair(`no response after 5 seconds on \`await getDocs(query)\``, 'query:', query), 5_000) // prettier-ignore
        : undefined
      const querySnapshot = await getDocs(query)
      clearTimeout(warnNoResponse)
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
