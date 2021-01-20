import {
  PluginFetchAction,
  FetchResponse,
  DoOnFetch,
  PluginFetchActionPayload,
  PluginActionPayloadBase,
} from '@magnetarjs/core'
import { VuexStorePluginModuleConfig, VuexStorePluginOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { Store } from 'vuex'

export function fetchActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists'
): PluginFetchAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<VuexStorePluginModuleConfig>): FetchResponse | DoOnFetch {
    const doOnFetchAction: DoOnFetch = (payload, meta): void => {
      insertActionFactory(
        store,
        vuexStorePluginOptions,
        setupModule
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
