import { isString } from 'is-what'
import {
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  PluginStreamActionPayload,
} from '@magnetarjs/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { deleteActionFactory } from './delete'

export function streamActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  simpleStoreOptions: SimpleStoreOptions
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<SimpleStoreModuleConfig>):
    | StreamResponse
    | DoOnStream
    | Promise<StreamResponse | DoOnStream> {
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        insertActionFactory(
          data,
          simpleStoreOptions
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
          simpleStoreOptions
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
          simpleStoreOptions
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
