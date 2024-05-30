import type { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/types'
import { MakeRestoreBackup, Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'

export function revertActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, unknown>> },
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
    if (docId) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    console.error(`[@magnetarjs/plugin-vue2] revert not yet implemented for ${actionName}`)
  }
}
