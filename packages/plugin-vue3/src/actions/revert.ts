import { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/core'
import { Vue3StoreModuleConfig, Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  Vue3StoreOptions: Vue3StoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<Vue3StoreModuleConfig>): void {
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
    console.error(`[@magnetarjs/plugin-vue3] revert not yet implemented for ${actionName}`)
  }
}
