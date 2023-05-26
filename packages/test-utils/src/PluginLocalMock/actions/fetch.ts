import { isNumber, isFullString, isBoolean } from 'is-what'
import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
  DocMetadata,
} from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { throwIfEmulatedError } from '../../helpers'

export function fetchActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  exists: { [docPath: string]: undefined | 'error' | boolean },
  storePluginOptions: StorePluginOptions
): PluginFetchAction {
  return function ({
    payload,
    actionConfig,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<StorePluginModuleConfig>): FetchResponse | DoOnFetch {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    const force = payload?.force === true
    const optimisticFetch = !force
    if (optimisticFetch) {
      if (!docId) {
        const { where, orderBy, limit, startAfter } = pluginModuleConfig
        const collectionData = filterDataPerClauses(data[collectionPath], {
          where,
          orderBy,
          limit,
          startAfter,
        })
        if (collectionData.size > 0) {
          const localDocs: DocMetadata[] = [...collectionData.entries()].map(([_docId, data]) => ({
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

      // abort updating local state if the payload was set to undefined
      if (_payload === undefined) return

      insertActionFactory(
        data,
        storePluginOptions
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
