import { PlainObject, PluginGetAction, GetResponse, DoOnGet } from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'
import { insertActionFactory } from './insert'

export function getActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot: any
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<GetResponse | DoOnGet> => {
    makeDataSnapshot()
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig)
    }
    return doOnGetAction
  }
}
