import type { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/types'
import { throwIfEmulatedError } from '../../helpers'
import { MakeRestoreBackup, StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
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
  }: PluginRevertActionPayload<StorePluginModuleConfig>): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    if (actionName === 'stream' || actionName === 'fetch') {
      // no need to "revert" anything on stream or fetch
      return
    }
    // revert all write actions when called on a doc
    if (
      docId &&
      ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    ) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    console.error(`[@magnetarjs/test-utils] revert not yet implemented for ${actionName}`)
  }
}
