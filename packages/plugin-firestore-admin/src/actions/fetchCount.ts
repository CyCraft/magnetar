import type {
  FetchCountResponse,
  PluginFetchCountAction,
  PluginFetchCountActionPayload,
} from '@magnetarjs/types'
import { FirestoreModuleConfig, getFirestoreCollectionPath } from '@magnetarjs/utils-firestore'
import { FirestoreAdminPluginOptions } from '../CreatePlugin.js'
import { getQueryInstance } from '../helpers/getFirestore.js'

export function fetchCountActionFactory(
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>
): PluginFetchCountAction {
  return async function ({
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<FirestoreModuleConfig>): Promise<FetchCountResponse> {
    const { db } = firestorePluginOptions
    // in case of a doc module
    const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

    const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)

    // see https://firebase.google.com/docs/firestore/query-data/aggregation-queries#use_the_count_aggregation

    const querySnapshot = await queryInstance.count().get()
    const count = querySnapshot.data().count
    return { count }
  }
}
