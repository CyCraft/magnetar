import { ExecutionContext } from 'ava'
import { VueSyncInstance, getCollectionPathDocIdEntry } from '@vue-sync/core'

export function isModuleDataEqual (
  t: ExecutionContext,
  vueSync: VueSyncInstance,
  modulePath: string,
  expected: any
): void {
  const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
  t.deepEqual(vueSync.doc(modulePath).data, expected)
  t.deepEqual(vueSync.collection(collectionPath).data.get(docId), expected)
  t.deepEqual(vueSync.collection(collectionPath).doc(docId).data, expected)
}
