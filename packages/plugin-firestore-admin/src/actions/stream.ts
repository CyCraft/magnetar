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
import type { DocumentChange, DocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore'
import { FirestoreAdminPluginOptions } from '../CreatePlugin.js'
import { docSnapshotToDocMetadata, getQueryInstance } from '../helpers/getFirestore.js'

export function streamActionFactory(
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>,
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
      closeStream = db
        .doc(documentPath)
        .onSnapshot((docSnapshot: DocumentSnapshot<{ [key: string]: unknown }>) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // Call onFirstData on first snapshot (whether doc exists or not)
          if (!firstDataReceived && onFirstData) {
            firstDataReceived = true
            setTimeout(() => onFirstData({ empty: !docSnapshot.exists }), 0)
          }

          // do nothing if the doc doesn't exist
          if (!docSnapshot.exists) return
          // serverChanges only
          const docData = docSnapshot.data()
          const docMetadata = docSnapshotToDocMetadata(docSnapshot)
          if (docData) added(docData, docMetadata)
        }, rejectStream)
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)
      closeStream = queryInstance.onSnapshot(
        (querySnapshot: QuerySnapshot<{ [key: string]: unknown }>) => {
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
