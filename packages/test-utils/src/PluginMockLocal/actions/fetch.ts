import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
  DocMetadata,
} from '../../../../core/src'
import { StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { throwIfEmulatedError } from '../../helpers'

export function fetchActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  storePluginOptions: StorePluginOptions
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<StorePluginModuleConfig>): FetchResponse | DoOnFetch {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    const optimisticFetch =
      !payload || !Object.hasOwnProperty.call(payload || {}, 'force') || payload?.force === false
    if (optimisticFetch) {
      const collectionData = data[collectionPath]
      if (!docId && collectionData.size > 0) {
        const localDocs: DocMetadata[] = [...collectionData.entries()].map(([_docId, data]) => ({
          data,
          exists: 'unknown',
          id: _docId,
        }))
        const fetchResponse: FetchResponse = { docs: localDocs }
        return fetchResponse
      }
      if (docId) {
        const localDoc = collectionData.get(docId)
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
      // abort updating local state if the payload was set to undefined
      if (_payload === undefined) return

      insertActionFactory(
        data,
        storePluginOptions
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
