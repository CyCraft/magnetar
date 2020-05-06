import { isArray } from 'is-what'
import { firestore } from 'firebase'
import { PluginDeletePropAction } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function deletePropActionFactory (
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeletePropAction {
  return async function (
    payload: string | string[],
    [collectionPath, docId]: [string, string | undefined],
    firestoreModuleConfig: FirestoreModuleConfig
  ): Promise<void> {
    const documentPath = getFirestoreDocPath([collectionPath, docId], firestoreModuleConfig, firestorePluginOptions) // prettier-ignore
    const payloadArray = isArray(payload) ? payload : [payload]
    const firestorePayload = payloadArray.reduce(
      (carry, propPath) => ({
        ...carry,
        [propPath]: firestore.FieldValue.delete(),
      }),
      {} as any
    )
    await batchSync.update(documentPath, firestorePayload)
  }
}
