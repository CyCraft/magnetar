import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
} from '@magnetarjs/core'
import { Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function fetchActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  Vue3StoreOptions: Vue3StoreOptions
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<Vue3StoreModuleConfig>): FetchResponse | DoOnFetch {
    const doOnFetchAction: DoOnFetch = (payload, meta): void => {
      insertActionFactory(
        data,
        Vue3StoreOptions
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
