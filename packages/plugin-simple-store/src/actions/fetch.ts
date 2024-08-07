import type {
  DocMetadata,
  DoOnFetch,
  FetchResponse,
  PluginFetchAction,
  PluginFetchActionPayload,
} from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { objGetOrSet } from 'getorset-anything'
import { isBoolean, isFullString, isNumber } from 'is-what'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin.js'
import { insertActionFactory } from './insert.js'

export function fetchActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  exists: { [docPath: string]: undefined | 'error' | boolean },
  simpleStoreOptions: SimpleStoreOptions,
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
  }: PluginFetchActionPayload<SimpleStoreModuleConfig>): FetchResponse | DoOnFetch {
    const force = payload?.force === true
    const optimisticFetch = !force
    if (optimisticFetch) {
      if (!docId) {
        const { query, where, orderBy, limit, startAfter } = pluginModuleConfig
        const foundData = objGetOrSet(data, collectionPath, () => new Map())
        const collectionData = filterDataPerClauses(foundData, {
          query,
          where,
          orderBy,
          limit,
          startAfter,
        })
        if (collectionData.size > 0) {
          const cachedDocs: DocMetadata[] = [...collectionData.entries()].map(([_docId, data]) => ({
            data,
            exists: 'unknown',
            id: _docId,
          }))
          const fetchResponse: FetchResponse = { docs: cachedDocs }
          return fetchResponse // if size === 0 fall through to returning DoOnFetch down below
        }
      }
      /**
       * when we are fetching a specific doc, let's only return the result if we're sure it exists on the server.
       * this prevents returning a document that was just inserted.
       */
      const itSureExists = exists[`${collectionPath}/${docId}`] === true
      if (docId && itSureExists) {
        const cachedDoc = data[collectionPath]?.get(docId)
        // if already fetched
        if (cachedDoc) {
          const fetchResponse: FetchResponse = {
            docs: [
              {
                data: cachedDoc,
                exists: 'unknown',
                id: docId,
              },
            ],
          }
          return fetchResponse
        }
        // if not yet fetched
        if (!cachedDoc) {
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

      // abort updating local cache state if the payload is undefined
      if (_payload === undefined) return

      insertActionFactory(
        data,
        simpleStoreOptions,
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
