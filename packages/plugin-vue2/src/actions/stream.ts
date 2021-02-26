import { isFullString, isString } from 'is-what'
import {
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  PluginStreamActionPayload,
} from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'

export function streamActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<Vue2StoreModuleConfig>):
    | StreamResponse
    | DoOnStream
    | Promise<StreamResponse | DoOnStream> {
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        const _docId = docId || `${meta.id}`
        insertActionFactory(
          data,
          vue2StoreOptions
        )({
          payload,
          collectionPath,
          docId: _docId,
          pluginModuleConfig,
        })
      },
      modified: (payload, meta) => {
        const _docId = docId || `${meta.id}`
        insertActionFactory(
          data,
          vue2StoreOptions
        )({
          payload,
          collectionPath,
          docId: _docId,
          pluginModuleConfig,
        })
      },
      removed: (payload, meta) => {
        const collectionPathDocIdToDelete: [string, string] = isFullString(docId)
          ? [collectionPath, docId]
          : isString(payload)
          ? [collectionPath, payload]
          : [collectionPath, meta.id]
        const [_cPath, _dId] = collectionPathDocIdToDelete
        deleteActionFactory(
          data,
          vue2StoreOptions
        )({
          payload: undefined,
          collectionPath: _cPath,
          docId: _dId,
          pluginModuleConfig,
        })
      },
    }
    return doOnStream
  }
}
