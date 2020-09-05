import { isArray } from 'is-what'
import * as Firebase from 'firebase/app'
import { PluginDeletePropAction, PluginDeletePropActionPayload } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function deletePropActionFactory (
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeletePropAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<FirestoreModuleConfig>): Promise<void> {
    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const payloadArray = isArray(payload) ? payload : [payload]
    const firestorePayload = payloadArray.reduce(
      (carry, propPath) => ({
        ...carry,
        [propPath]: Firebase.firestore.FieldValue.delete(),
      }),
      {} as any
    )
    await batchSync.update(documentPath, firestorePayload)
  }
}
