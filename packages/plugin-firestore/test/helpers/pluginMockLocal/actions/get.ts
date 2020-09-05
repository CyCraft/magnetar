import {
  PlainObject,
  PluginGetAction,
  GetResponse,
  DoOnGet,
  PluginGetActionPayload,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { throwIfEmulatedError } from '../../throwFns'

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
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

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
