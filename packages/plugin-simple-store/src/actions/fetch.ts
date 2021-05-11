import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
  DocMetadata,
} from '@magnetarjs/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function fetchActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  simpleStoreOptions: SimpleStoreOptions
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<SimpleStoreModuleConfig>): FetchResponse | DoOnFetch {
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
        simpleStoreOptions
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
