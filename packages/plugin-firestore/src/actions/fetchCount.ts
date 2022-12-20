import { getCountFromServer } from 'firebase/firestore'
import {
  PluginFetchCountAction,
  FetchCountResponse,
  PluginFetchCountActionPayload,
} from '@magnetarjs/types'
import { FirestoreModuleConfig, getFirestoreCollectionPath } from '@magnetarjs/utils-firestore'
import { getQueryInstance } from '../helpers/getFirestore'
import { FirestorePluginOptions } from '../CreatePlugin'

export function fetchCountActionFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
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

    const querySnapshot = await getCountFromServer(queryInstance)
    const count = querySnapshot.data().count
    return { count }
  }
}