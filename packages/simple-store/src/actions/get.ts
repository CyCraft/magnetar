import { PlainObject, PluginGetAction, GetResponse, DoOnGet } from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '..'
import { insertActionFactory } from './insert'

export function getActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<GetResponse | DoOnGet> => {
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(data, simpleStoreOptions)(payload, modulePath, simpleStoreModuleConfig)
    }
    return doOnGetAction
  }
}
