import { PlainObject, PluginGetAction, GetResponse, DoOnGet } from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function getActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    [collectionPath, docId]: [string, string | undefined],
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<GetResponse | DoOnGet> => {
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(data, simpleStoreOptions)(
        payload,
        [collectionPath, docId],
        simpleStoreModuleConfig
      )
    }
    return doOnGetAction
  }
}
