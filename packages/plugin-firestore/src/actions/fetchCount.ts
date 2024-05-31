import type {
  FetchCountResponse,
  PluginFetchCountAction,
  PluginFetchCountActionPayload,
} from '@magnetarjs/types'
import { FirestoreModuleConfig, getFirestoreCollectionPath } from '@magnetarjs/utils-firestore'
import { getCountFromServer } from 'firebase/firestore'
import { FirestorePluginOptions } from '../CreatePlugin.js'
import { getQueryInstance } from '../helpers/getFirestore.js'

export function fetchCountActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginFetchCountAction {
  return async function ({
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<FirestoreModuleConfig>): Promise<FetchCountResponse> {
    const { db, debug } = firestorePluginOptions
    // in case of a doc module
    const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

    const query = getQueryInstance(_collectionPath, pluginModuleConfig, db, debug)

    // see https://firebase.google.com/docs/firestore/query-data/aggregation-queries#use_the_count_aggregation

    const querySnapshot = await getCountFromServer(query)
    const count = querySnapshot.data().count
    return { count }
  }
}
