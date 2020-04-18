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
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should be merged into the local stores
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(moduleData, simpleStoreConfig)(payload, modulePath, pluginModuleConfig)
      // return writeActionFactoryThatReturnsPayload(moduleData, 'insert', simpleStoreConfig)(
      //   payload,
      //   modulePath,
      //   pluginModuleConfig
      // )
    }
    // in case of a local store that doesn't fetch from anywhere, not even from cach, we could return early here
    return doOnGetAction
  }
}
