import { isArray, isNumber } from 'is-what'
import { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'
import { BatchSync } from '../helpers/batchSync'
import { getFirestoreDocPath } from '../helpers/pathHelpers'

export function deletePropActionFactory(
  batchSync: BatchSync,
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginDeletePropAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<FirestoreModuleConfig>): Promise<void> {
    if (!docId) throw new Error('An non-existent action was triggered on a collection')
    const { firebaseInstance } = firestorePluginOptions
    const documentPath = getFirestoreDocPath(collectionPath, docId, pluginModuleConfig, firestorePluginOptions) // prettier-ignore
    const payloadArray = isArray(payload) ? payload : [payload]
    const firestorePayload = payloadArray.reduce(
      (carry, propPath) => ({
        ...carry,
        [propPath]: firebaseInstance.firestore.FieldValue.delete(),
      }),
      {} as any
    )
    const syncDebounceMs = isNumber(actionConfig.syncDebounceMs)
      ? actionConfig.syncDebounceMs
      : pluginModuleConfig.syncDebounceMs

    await batchSync.update(documentPath, firestorePayload, syncDebounceMs)
  }
}
