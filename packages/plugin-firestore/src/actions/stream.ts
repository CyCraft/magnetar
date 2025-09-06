import type {
  PluginStreamAction,
  PluginStreamActionPayload,
  StreamResponse,
} from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreCollectionPath,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import type { DocumentChange, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'
import { doc, onSnapshot } from 'firebase/firestore'
import { FirestorePluginOptions } from '../CreatePlugin.js'
import { docSnapshotToDocMetadata, getQueryInstance } from '../helpers/getFirestore.js'

export function streamActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>,
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<FirestoreModuleConfig>): StreamResponse {
    const { added, modified, removed } = mustExecuteOnRead
    const { db, debug } = firestorePluginOptions

    // Extract onFirstData callback from payload if provided
    const onFirstData = payload?.onFirstData

    let resolveStream: (() => void) | undefined
    let rejectStream: (() => void) | undefined
    const streaming = new Promise<void>((resolve, reject) => {
      resolveStream = resolve
      rejectStream = reject
    })
    let closeStream: any
    let firstDataReceived = false

    // in case of a doc module
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      closeStream = onSnapshot(
        doc(db, documentPath),
        (docSnapshot: DocumentSnapshot<{ [key: string]: unknown }>) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // Call onFirstData on first snapshot (whether doc exists or not)
          if (!firstDataReceived && onFirstData) {
            firstDataReceived = true
            setTimeout(() => onFirstData({ empty: !docSnapshot.exists() }), 0)
          }

          // do nothing if the doc doesn't exist
          if (!docSnapshot.exists()) return
          // serverChanges only
          const docData = docSnapshot.data()
          const docMetadata = docSnapshotToDocMetadata(docSnapshot)
          if (docData) added(docData, docMetadata)
        },
        rejectStream,
      )
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const query = getQueryInstance(_collectionPath, pluginModuleConfig, db, debug)
      closeStream = onSnapshot(
        query,
        (querySnapshot: QuerySnapshot) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // Call onFirstData on first snapshot (whether collection has docs or not)
          if (!firstDataReceived && onFirstData) {
            firstDataReceived = true
            setTimeout(() => onFirstData({ empty: querySnapshot.empty }), 0)
          }

          // serverChanges only
          querySnapshot
            .docChanges()
            .forEach((docChange: DocumentChange<{ [key: string]: unknown }>) => {
              const docSnapshot = docChange.doc
              const docData = docSnapshot.data()
              const docMetadata = docSnapshotToDocMetadata(docSnapshot)
              if (docChange.type === 'added' && docData) {
                added(docData, docMetadata)
              }
              if (docChange.type === 'modified' && docData) {
                modified(docData, docMetadata)
              }
              if (docChange.type === 'removed') {
                removed(docData, docMetadata)
              }
            })
        },
        rejectStream,
      )
    }
    function stop(): void {
      if (resolveStream) resolveStream()
      closeStream()
    }
    return { stop, streaming }
  }
}
