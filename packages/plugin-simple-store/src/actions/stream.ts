import type {
  DoOnStream,
  PluginStreamAction,
  PluginStreamActionPayload,
  StreamResponse,
} from '@magnetarjs/types'
import { isFullString, isString } from 'is-what'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin.js'
import { deleteActionFactory } from './delete.js'
import { insertActionFactory } from './insert.js'

export function streamActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  simpleStoreOptions: SimpleStoreOptions,
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<SimpleStoreModuleConfig>):
    | StreamResponse
    | DoOnStream
    | Promise<StreamResponse | DoOnStream> {
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        // abort updating local cache state if the payload was set to undefined
        if (payload === undefined) return undefined

        const _docId = docId || `${meta.id}`
        insertActionFactory(
          data,
          simpleStoreOptions,
        )({
          payload,
          collectionPath,
          docId: _docId,
          actionConfig,
          pluginModuleConfig,
        })
        return undefined
      },
      modified: (payload, meta) => {
        // abort updating local cache state if the payload was set to undefined
        if (payload === undefined) return undefined

        const _docId = docId || `${meta.id}`
        insertActionFactory(
          data,
          simpleStoreOptions,
        )({
          payload,
          collectionPath,
          docId: _docId,
          actionConfig,
          pluginModuleConfig,
        })
        return undefined
      },
      removed: (payload, meta) => {
        // abort updating local cache state if the payload was set to undefined
        if (payload === undefined) return undefined

        const collectionPathDocIdToDelete: [string, string] = isFullString(docId)
          ? [collectionPath, docId]
          : isString(payload)
            ? [collectionPath, payload]
            : [collectionPath, meta.id]
        const [_cPath, _dId] = collectionPathDocIdToDelete
        deleteActionFactory(
          data,
          simpleStoreOptions,
        )({
          payload: undefined,
          collectionPath: _cPath,
          docId: _dId,
          actionConfig,
          pluginModuleConfig,
        })
        return undefined
      },
    }
    return doOnStream
  }
}
