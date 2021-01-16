import { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function revertActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<Vue2StoreModuleConfig>): void {
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
    // haven't implemented reverting 'get', 'stream' actions yet
    console.error(`[@magnetarjs/plugin-vue2] revert not yet implemented for ${actionName}`)
  }
}
