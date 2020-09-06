import { PluginGetAction, GetResponse, DoOnGet, PluginGetActionPayload } from '@magnetarjs/core'
import { ReactiveStoreModuleConfig, ReactiveStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function getActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  reactiveStoreOptions: ReactiveStoreOptions
): PluginGetAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginGetActionPayload<ReactiveStoreModuleConfig>): GetResponse | DoOnGet {
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(
        data,
        reactiveStoreOptions
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
