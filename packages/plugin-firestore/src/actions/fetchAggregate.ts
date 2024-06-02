import type {
  FetchAggregateResponse,
  PluginFetchAggregateAction,
  PluginFetchAggregateActionPayload,
} from '@magnetarjs/types'
import { FirestoreModuleConfig, getFirestoreCollectionPath } from '@magnetarjs/utils-firestore'
import { average, getAggregateFromServer, sum } from 'firebase/firestore'
import { FirestorePluginOptions } from '../CreatePlugin.js'
import { getQueryInstance } from '../helpers/getFirestore.js'

export function fetchAggregateActionFactory(
  kind: 'sum' | 'average',
  firestorePluginOptions: Required<FirestorePluginOptions>,
): PluginFetchAggregateAction {
  return async function ({
    payload,
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchAggregateActionPayload<FirestoreModuleConfig>): Promise<FetchAggregateResponse> {
    const { db, debug } = firestorePluginOptions
    // in case of a doc module
    const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

    const query = getQueryInstance(_collectionPath, pluginModuleConfig, db, debug)

    // see https://firebase.google.com/docs/firestore/query-data/aggregation-queries#web-modular-api_2

    const querySnapshot = await getAggregateFromServer(query, {
      TEMP_FIELD_NAME: kind === 'sum' ? sum(payload) : average(payload),
    })
    const result = querySnapshot.data()['TEMP_FIELD_NAME']
    return result
  }
}
