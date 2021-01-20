import { PluginRevertAction, PluginRevertActionPayload } from '../../../../core/src'
import { StorePluginModuleConfig, StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin'
import { throwIfEmulatedError } from '../../helpers'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
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
    // haven't implemented reverting 'fetch', 'stream' actions yet
    console.error(`[@magnetarjs/test-utils] revert not yet implemented for ${actionName}`)
  }
}
