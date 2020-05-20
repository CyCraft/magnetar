import { PlainObject, PluginRevertAction, PluginRevertActionPayload } from '@vue-sync/core'
import { ReactiveStoreModuleConfig, ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function revertActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  reactiveStoreOptions: ReactiveStoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<ReactiveStoreModuleConfig>): void {
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
    console.error(`[@vue-sync/reactive-store] revert not yet implemented for ${actionName}`)
  }
}
