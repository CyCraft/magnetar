import type {
  DocMetadata,
  DoOnFetch,
  FetchResponse,
  PluginFetchAction,
  PluginFetchActionPayload,
} from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { isBoolean, isFullString, isNumber } from 'is-what'
import { Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function fetchActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, unknown>> },
  exists: { [docPath: string]: undefined | 'error' | boolean },
  vue2StoreOptions: Vue2StoreOptions
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchActionPayload<Vue2StoreModuleConfig>): FetchResponse | DoOnFetch {
    const force = payload?.force === true
    const optimisticFetch = !force
    if (optimisticFetch) {
      if (!docId) {
        const { query, where, orderBy, limit } = pluginModuleConfig
        const collectionData = filterDataPerClauses(new Map(Object.entries(data[collectionPath])), {
          query,
          where,
          orderBy,
          limit,
        })
        if (Object.keys(collectionData).length > 0) {
          const localDocs: DocMetadata[] = Object.entries(collectionData).map(([_docId, data]) => ({
            data,
            exists: 'unknown',
            id: _docId,
          }))
          const fetchResponse: FetchResponse = { docs: localDocs }
          return fetchResponse // if size === 0 fall through to returning DoOnFetch down below
        }
      }
      /**
       * when we are fetching a specific doc, let's only return the result if we're sure it exists on the server.
       * this prevents returning a document that was just inserted.
       */
      const itSureExists = exists[`${collectionPath}/${docId}`] === true
      if (docId && itSureExists) {
        const localDoc = data[collectionPath][docId]
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
    const doOnFetchAction: DoOnFetch = (_payload, meta) => {
      const _docId = docId
        ? docId
        : meta === 'error'
        ? undefined
        : isFullString(meta?.id)
        ? meta.id
        : isNumber(meta?.id)
        ? `${meta.id}`
        : undefined
      // set `exists`
      const docPath = `${collectionPath}/${_docId}`
      if (meta === 'error') {
        exists[docPath] = 'error'
        return
      }
      if (isBoolean(meta?.exists)) {
        exists[docPath] = meta.exists
      }

      // abort updating local state if the payload is undefined
      if (_payload === undefined) return

      insertActionFactory(
        data,
        vue2StoreOptions
      )({
        payload: _payload,
        collectionPath,
        docId: _docId,
        actionConfig,
        pluginModuleConfig,
      })

      return _payload
    }
    return doOnFetchAction
  }
}
