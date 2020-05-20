import {
  PlainObject,
  PluginGetAction,
  GetResponse,
  DoOnGet,
  PluginGetActionPayload,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'

export function getActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions
): PluginGetAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginGetActionPayload<SimpleStoreModuleConfig>): GetResponse | DoOnGet {
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(
        data,
        simpleStoreOptions
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
