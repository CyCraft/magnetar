import type {
  DoOnStream,
  PluginStreamAction,
  PluginStreamActionPayload,
  StreamResponse,
} from '@magnetarjs/types'
import { isString } from 'is-what'
import { throwIfEmulatedError } from '../../helpers/index.js'
import { StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin.js'
import { deleteActionFactory } from './delete.js'
import { insertActionFactory } from './insert.js'

export function streamActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  storePluginOptions: StorePluginOptions,
): PluginStreamAction {
  return function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<StorePluginModuleConfig>):
    | StreamResponse
    | DoOnStream
    | Promise<StreamResponse | DoOnStream> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        // abort updating local cache state if the payload was set to undefined
        if (payload === undefined) return undefined

        insertActionFactory(
          data,
          storePluginOptions,
        )({
          payload,
          collectionPath,
          docId,
          actionConfig,
          pluginModuleConfig,
        })
        return undefined
      },
      modified: (payload, meta) => {
        // abort updating local cache state if the payload was set to undefined
        if (payload === undefined) return undefined

        insertActionFactory(
          data,
          storePluginOptions,
        )({
          payload,
          collectionPath,
          docId,
          actionConfig,
          pluginModuleConfig,
        })
        return undefined
      },
      removed: (payload, meta) => {
        const collectionPathDocIdToDelete: [string, string] = docId
          ? [collectionPath, docId]
          : isString(payload)
            ? [collectionPath, payload]
            : [collectionPath, meta.id]
        const [_cPath, _dId] = collectionPathDocIdToDelete
        // abort updating local cache state if the payload was set to undefined
        if (payload === undefined) return undefined

        deleteActionFactory(
          data,
          storePluginOptions,
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
