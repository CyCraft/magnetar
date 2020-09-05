import { PlainObject, PluginGetAction, GetResponse, DoOnGet } from '../../../../src'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'
import { insertActionFactory } from './insert'
import { throwIfEmulatedError } from '../../throwFns'

export function getActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    [collectionPath, docId]: [string, string | undefined],
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<GetResponse | DoOnGet> => {
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

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
