import type {
  DocumentSnapshot,
  QuerySnapshot,
  DocumentChange,
  QueryDocumentSnapshot,
  Firestore,
} from 'firebase-admin/firestore'
import { StreamResponse, PluginStreamAction, PluginStreamActionPayload } from '@magnetarjs/types'
import {
  FirestoreModuleConfig,
  getFirestoreCollectionPath,
  getFirestoreDocPath,
} from '@magnetarjs/utils-firestore'
import { getQueryInstance, docSnapshotToDocMetadata } from '../helpers/getFirestore'
import { FirestoreAdminPluginOptions } from '../CreatePlugin'

export function streamActionFactory(
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>
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
    let closeStream: any
    // in case of a doc module
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      closeStream = db
        .doc(documentPath)
        .onSnapshot((docSnapshot: DocumentSnapshot<Record<string, unknown>>) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // do nothing if the doc doesn't exist
          if (!docSnapshot.exists) return
          // serverChanges only
          const docData = docSnapshot.data()
          const docMetadata = docSnapshotToDocMetadata(docSnapshot)
          added(docData, docMetadata)
        }, rejectStream)
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)
      closeStream = queryInstance.onSnapshot(
        (querySnapshot: QuerySnapshot<Record<string, unknown>>) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // serverChanges only
          querySnapshot
            .docChanges()
            .forEach((docChange: DocumentChange<Record<string, unknown>>) => {
              const docSnapshot = docChange.doc
              const docData = docSnapshot.data()
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
      closeStream()
    }
    return { stop, streaming }
  }
}
