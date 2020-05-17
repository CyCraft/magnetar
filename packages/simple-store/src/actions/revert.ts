import { PlainObject, PluginRevertAction, PluginRevertActionPayload } from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function revertActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
  }: PluginRevertActionPayload<SimpleStoreModuleConfig>): void {
    // revert all write actions when called on a doc
    if (
      docId &&
      ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    ) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') {
      throw new Error(`revert not yet implemented for insert on collections`)
    }
    // haven't implemented reverting 'get', 'stream' actions yet
    throw new Error(`revert not yet implemented for ${actionName}`)
  }
}
