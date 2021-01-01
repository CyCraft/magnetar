import { isFullString } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  reactiveStoreOptions: Vue2StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<Vue2StoreModuleConfig>): void {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    data[collectionPath].delete(_docId)
  }
}
