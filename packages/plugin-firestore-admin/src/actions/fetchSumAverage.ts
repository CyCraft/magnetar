import type {
  FetchAggregateResponse,
  PluginFetchSumAverageAction,
  PluginFetchSumAverageActionPayload,
} from '@magnetarjs/types'
import { FirestoreModuleConfig, getFirestoreCollectionPath } from '@magnetarjs/utils-firestore'
import { AggregateField } from 'firebase-admin/firestore'
import { FirestoreAdminPluginOptions } from '../CreatePlugin.js'
import { getQueryInstance } from '../helpers/getFirestore.js'

export function fetchSumAverageActionFactory(
  kind: 'sum' | 'average',
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>,
): PluginFetchSumAverageAction {
  return async function ({
    payload,
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchSumAverageActionPayload<FirestoreModuleConfig>): Promise<FetchAggregateResponse> {
    const { db } = firestorePluginOptions
    // in case of a doc module
    const _collectionPath = getFirestoreCollectionPath(collectionPath, pluginModuleConfig, firestorePluginOptions) // prettier-ignore

    const queryInstance = getQueryInstance(_collectionPath, pluginModuleConfig, db)

    // see https://firebase.google.com/docs/firestore/query-data/aggregation-queries#web-modular-api_2

    const querySnapshot = await queryInstance
      .aggregate({
        TEMP_FIELD_NAME:
          kind === 'sum' ? AggregateField.sum(payload) : AggregateField.average(payload),
      })
      .get()

    const count = querySnapshot.data()['TEMP_FIELD_NAME']
    return count
  }
}
