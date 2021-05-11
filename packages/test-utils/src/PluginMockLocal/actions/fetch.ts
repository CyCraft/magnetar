import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
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
