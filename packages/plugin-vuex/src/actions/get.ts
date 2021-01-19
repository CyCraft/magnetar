import {
  PluginGetAction,
  GetResponse,
  DoOnGet,
  PluginGetActionPayload,
  PluginActionPayloadBase,
} from '@magnetarjs/core'
import { VuexStorePluginModuleConfig, VuexStorePluginOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { Store } from 'vuex'

export function getActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists'
): PluginGetAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginGetActionPayload<VuexStorePluginModuleConfig>): GetResponse | DoOnGet {
    const doOnGetAction: DoOnGet = (payload, meta): void => {
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
    return doOnGetAction
  }
}
