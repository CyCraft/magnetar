import { PluginGetAction, GetResponse, DoOnGet, PluginGetActionPayload } from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function getActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions
): PluginGetAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginGetActionPayload<Vue2StoreModuleConfig>): GetResponse | DoOnGet {
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(
        data,
        vue2StoreOptions
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
