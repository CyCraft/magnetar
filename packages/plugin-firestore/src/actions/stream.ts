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
import { isPromise, isString } from 'is-what'
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
    writeLockMap,
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
    if (isString(docId)) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

      // Pool doc snapshots that arrive while waiting for write lock
      let pendingSnapshot: DocumentSnapshot<{ [key: string]: unknown }> | null = null
      let isProcessing = false

      const processDocSnapshot = (docSnapshot: DocumentSnapshot<{ [key: string]: unknown }>) => {
        // do nothing if the doc doesn't exist
        if (!docSnapshot.exists()) return
        // serverChanges only
        const docData = docSnapshot.data()
        const docMetadata = docSnapshotToDocMetadata(docSnapshot)
        if (docData) added(docData, docMetadata)
      }

      closeStream = onSnapshot(
        doc(db, documentPath),
        async (docSnapshot: DocumentSnapshot<{ [key: string]: unknown }>) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // Store latest snapshot (only need the most recent for a single doc)
          pendingSnapshot = docSnapshot

          // If already processing, let the current processor handle it
          if (isProcessing) return

          // Check for write lock
          const collectionWriteLock = writeLockMap.get(collectionPath)
          if (collectionWriteLock && isPromise(collectionWriteLock.promise)) {
            isProcessing = true
            await collectionWriteLock.promise
          }

          // Process the latest pending snapshot
          if (pendingSnapshot) {
            const snapshot = pendingSnapshot
            pendingSnapshot = null
            processDocSnapshot(snapshot)
          }

          // Call onFirstData after processing (after write lock, whether doc exists or not)
          if (!firstDataReceived && onFirstData) {
            firstDataReceived = true
            setTimeout(() => onFirstData({ empty: !docSnapshot.exists() }), 0)
          }
          isProcessing = false
        },
        rejectStream,
      )
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const query = getQueryInstance(_collectionPath, pluginModuleConfig, db, debug)

      // Pool querySnapshots that arrive while waiting for write lock
      const pendingSnapshots: QuerySnapshot[] = []
      let isProcessing = false

      closeStream = onSnapshot(
        query,
        async (querySnapshot: QuerySnapshot) => {
          // even if `docSnapshot.metadata.hasPendingWrites`
          //       we should always execute `added/modified`
          //       because `core` handles overlapping calls for us

          // Add to pending pool
          pendingSnapshots.push(querySnapshot)

          // If already processing, let the current processor handle it
          if (isProcessing) return

          // Check for write lock
          const collectionWriteLock = writeLockMap.get(collectionPath)
          if (collectionWriteLock && isPromise(collectionWriteLock.promise)) {
            isProcessing = true
            await collectionWriteLock.promise
          }

          // Merge all pending snapshots into a single map of docId -> final state
          const mergedDocs = new Map<
            string,
            {
              type: 'added' | 'modified' | 'removed'
              docData: { [key: string]: unknown }
              docMetadata: Parameters<typeof added>[1]
            }
          >()

          let snapshot = pendingSnapshots.shift()
          while (snapshot) {
            snapshot
              .docChanges()
              .forEach((docChange: DocumentChange<{ [key: string]: unknown }>) => {
                const docSnapshot = docChange.doc
                const docData = docSnapshot.data()
                const docMetadata = docSnapshotToDocMetadata(docSnapshot)
                // Always overwrite with the latest state for this doc
                mergedDocs.set(docSnapshot.id, { type: docChange.type, docData, docMetadata })
              })
            snapshot = pendingSnapshots.shift()
          }

          // Process the merged final states
          for (const { type, docData, docMetadata } of mergedDocs.values()) {
            if (type === 'added' && docData) {
              added(docData, docMetadata)
            }
            if (type === 'modified' && docData) {
              modified(docData, docMetadata)
            }
            if (type === 'removed') {
              removed(docData, docMetadata)
            }
          }

          // Call onFirstData after processing (after write lock, whether collection has docs or not)
          if (!firstDataReceived && onFirstData) {
            firstDataReceived = true
            setTimeout(() => onFirstData({ empty: querySnapshot.empty }), 0)
          }
          isProcessing = false
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
