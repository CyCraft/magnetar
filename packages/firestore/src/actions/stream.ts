import {
  StreamResponse,
  PluginStreamAction,
  PluginStreamActionPayload,
  PlainObject,
} from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { getFirestoreDocPath, getFirestoreCollectionPath } from '../helpers/pathHelpers'
import { getQueryInstance, docSnapshotToDocMetadata } from 'src/helpers/queryHelpers'

export function streamActionFactory (
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
    const { firestoreInstance } = firestorePluginOptions
    let resolveStream: () => void
    let rejectStream: () => void
    const streaming: Promise<void> = new Promise((resolve, reject) => {
      resolveStream = resolve
      rejectStream = reject
    })
    let unsubscribeStream
    // in case of a doc module
    if (docId) {
      const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      unsubscribeStream = firestoreInstance.doc(documentPath).onSnapshot(docSnapshot => {
        const localChange = docSnapshot.metadata.hasPendingWrites
        // do nothing for local changes
        if (localChange) return
        // serverChanges only
        const docData = docSnapshot.data() as PlainObject
        const docMetadata = docSnapshotToDocMetadata(docSnapshot)
        added(docData, docMetadata)
      }, rejectStream)
    }
    // in case of a collection module
    else if (!docId) {
      const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
      const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, firestoreInstance)
      unsubscribeStream = queryInstance.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(docChange => {
          const docSnapshot = docChange.doc
          // do nothing for local changes
          const localChange = docSnapshot.metadata.hasPendingWrites
          // serverChanges only
          if (localChange) return
          const docData = docSnapshot.data() as PlainObject
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
      }, rejectStream)
    }
    function stop (): void {
      resolveStream()
      unsubscribeStream()
    }
    return { stop, streaming }
  }
}
