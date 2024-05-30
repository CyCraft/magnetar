import type { PluginRevertAction, PluginRevertActionPayload } from '@magnetarjs/types'
import { MakeRestoreBackup, SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'

export function revertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
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
    if (docId) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    console.error(`[@magnetarjs/plugin-simple-store] revert not yet implemented for ${actionName}`)
  }
}
