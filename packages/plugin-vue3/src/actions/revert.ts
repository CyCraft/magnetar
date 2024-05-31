import type { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/types'
import { MakeRestoreBackup, Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin.js'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
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
  }: PluginRevertActionPayload<Vue3StoreModuleConfig>): undefined {
    // revert all write actions when called on a doc
    if (docId) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    console.error(`[@magnetarjs/plugin-vue3] revert not yet implemented for ${actionName}`)
  }
}
