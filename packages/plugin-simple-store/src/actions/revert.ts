import { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  simpleStoreOptions: SimpleStoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
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
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    // haven't implemented reverting 'fetch', 'stream' actions yet
    console.error(`[@magnetarjs/plugin-simple-store] revert not yet implemented for ${actionName}`)
  }
}
