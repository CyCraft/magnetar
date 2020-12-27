import { isFullString } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/core'
import { ReactiveStoreModuleConfig, ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  reactiveStoreOptions: ReactiveStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<ReactiveStoreModuleConfig>): void {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    data[collectionPath].delete(_docId)
  }
}
