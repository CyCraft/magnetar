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

    const doOnFetchAction: DoOnFetch = (payload, meta): void => {
      insertActionFactory(
        data,
        storePluginOptions
      )({
        payload,
        collectionPath,
        docId,
        pluginModuleConfig,
      })
    }
    return doOnFetchAction
  }
}
