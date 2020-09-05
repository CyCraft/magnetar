import { PlainObject, PluginDeleteAction, PluginDeleteActionPayload } from '@vue-sync/core'
import { ReactiveStoreModuleConfig, ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deleteActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  reactiveStoreOptions: ReactiveStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<ReactiveStoreModuleConfig>): void {
    // delete cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    if (makeBackup) makeBackup(collectionPath, docId)

    data[collectionPath].delete(docId)
  }
}
