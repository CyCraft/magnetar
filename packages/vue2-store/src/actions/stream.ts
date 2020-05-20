import { isString } from 'is-what'
import {
  PlainObject,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  PluginStreamActionPayload,
} from '@vue-sync/core'
import { ReactiveStoreModuleConfig, ReactiveStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'

export function streamActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  reactiveStoreOptions: ReactiveStoreOptions
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<ReactiveStoreModuleConfig>):
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
