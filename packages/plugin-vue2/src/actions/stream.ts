import { isString } from 'is-what'
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
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  reactiveStoreOptions: Vue2StoreOptions
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
        insertActionFactory(
          data,
          reactiveStoreOptions
        )({
          payload,
          collectionPath,
          docId,
          pluginModuleConfig,
        })
      },
      modified: (payload, meta) => {
        insertActionFactory(
          data,
          reactiveStoreOptions
        )({
          payload,
          collectionPath,
          docId,
          pluginModuleConfig,
        })
      },
      removed: (payload, meta) => {
        const collectionPathDocIdToDelete: [string, string] = docId
          ? [collectionPath, docId]
          : isString(payload)
          ? [collectionPath, payload]
          : [collectionPath, meta.id]
        const [_cPath, _dId] = collectionPathDocIdToDelete
        deleteActionFactory(
          data,
          reactiveStoreOptions
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
