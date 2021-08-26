import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
  DocMetadata,
} from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function fetchActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchActionPayload<Vue2StoreModuleConfig>): FetchResponse | DoOnFetch {
    const optimisticFetch =
      !payload || !Object.hasOwnProperty.call(payload || {}, 'force') || payload?.force === false
    if (optimisticFetch) {
      const collectionData = data[collectionPath]
      if (!docId && Object.keys(collectionData).length > 0) {
        const localDocs: DocMetadata[] = Object.entries(collectionData).map(([_docId, data]) => ({
          data,
          exists: 'unknown',
          id: _docId,
        }))
        const fetchResponse: FetchResponse = { docs: localDocs }
        return fetchResponse
      }
      if (docId) {
        const localDoc = collectionData[docId]
        // if already fetched
        if (localDoc) {
          const fetchResponse: FetchResponse = {
            docs: [
              {
                data: localDoc,
                exists: 'unknown',
                id: docId,
              },
            ],
          }
          return fetchResponse
        }
        // if not yet fetched
        if (!localDoc) {
          // fall through to returning DoOnFetch down below
        }
      }
    }
    const doOnFetchAction: DoOnFetch = (_payload, meta): void => {
      // abort updating local state if the payload is undefined
      if (_payload === undefined) return

      insertActionFactory(
        data,
        vue2StoreOptions
      )({
        payload: _payload,
        collectionPath,
        docId,
        actionConfig,
        pluginModuleConfig,
      })
    }
    return doOnFetchAction
  }
}
