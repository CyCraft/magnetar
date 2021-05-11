import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
  DocMetadata,
} from '@magnetarjs/core'
import { Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function fetchActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  Vue3StoreOptions: Vue3StoreOptions
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<Vue3StoreModuleConfig>): FetchResponse | DoOnFetch {
    if (payload && payload.ifUnfetched === true) {
      if (!docId) {
        const localDocs: DocMetadata[] = [...data[collectionPath].entries()].map(
          ([_docId, data]) => ({
            data,
            exists: 'unknown',
            id: _docId,
          })
        )
        const fetchResponse: FetchResponse = { docs: localDocs }
        return fetchResponse
      }
      if (docId) {
        const localDoc = data[collectionPath].get(docId)
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
        Vue3StoreOptions
      )({
        payload: _payload,
        collectionPath,
        docId,
        pluginModuleConfig,
      })
    }
    return doOnFetchAction
  }
}
