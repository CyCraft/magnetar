import type { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/types'
import { throwIfEmulatedError } from '../../helpers/index.js'
import { MakeRestoreBackup, StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin.js'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  storePluginOptions: StorePluginOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<StorePluginModuleConfig>): undefined {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    // revert all write actions when called on a doc
    if (docId) {
      restoreBackup(collectionPath, docId)
      return undefined
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    console.error(`[@magnetarjs/test-utils] revert not yet implemented for ${actionName}`)
    return undefined
  }
}
