import type {
  DocumentSnapshot,
  QuerySnapshot,
  DocumentChange,
  QueryDocumentSnapshot,
} from '@firebase/firestore'
import { doc, onSnapshot } from '@firebase/firestore'
import { StreamResponse, PluginStreamAction, PluginStreamActionPayload } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { getFirestoreDocPath, getFirestoreCollectionPath } from '../helpers/pathHelpers'
import { getQueryInstance, docSnapshotToDocMetadata } from '../helpers/queryHelpers'

export function streamActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<FirestoreModuleConfig>): StreamResponse {
    const { added, modified, removed } = mustExecuteOnRead
    const { db } = firestorePluginOptions
    let resolveStream: (() => void) | undefined
    let rejectStream: (() => void) | undefined
    const streaming: Promise<void> = new Promise((resolve, reject) => {
      resolveStream = resolve
      rejectStream = reject
    })
    let closeStreamStream: any
    // in case of a doc module
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      closeStreamStream = onSnapshot(
        doc(db, documentPath),
        (docSnapshot: DocumentSnapshot) => {
          const localChange = docSnapshot.metadata.hasPendingWrites
          // do nothing for local changes
          if (localChange) return
          // do nothing if the doc doesn't exist
          if (!docSnapshot.exists) return
          // serverChanges only
          const docData = docSnapshot.data() as Record<string, any>
          const docMetadata = docSnapshotToDocMetadata(docSnapshot)
          added(docData, docMetadata)
        },
        rejectStream
      )
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)
      closeStreamStream = onSnapshot(
        queryInstance,
        (querySnapshot: QuerySnapshot) => {
          // do nothing for local changes
          const localChanges = querySnapshot.metadata.hasPendingWrites
          if (localChanges) return
          // serverChanges only
          querySnapshot.docChanges().forEach((docChange: DocumentChange) => {
            const docSnapshot: QueryDocumentSnapshot = docChange.doc
            const docData = docSnapshot.data() as Record<string, any>
            const docMetadata = docSnapshotToDocMetadata(docSnapshot)
            if (docChange.type === 'added') {
              added(docData, docMetadata)
            }
            if (docChange.type === 'modified') {
              modified(docData, docMetadata)
            }
            if (docChange.type === 'removed') {
              removed(docData, docMetadata)
            }
          })
        },
        rejectStream
      )
    }
    function stop(): void {
      if (resolveStream) resolveStream()
      closeStreamStream()
    }
    return { stop, streaming }
  }
}
