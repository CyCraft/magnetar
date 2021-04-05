import { isFullString } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/core'
import { Vue3StoreModuleConfig, Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { parsedCollectionPath } from '../helpers/pathHelpers'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  Vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<Vue3StoreModuleConfig>): void {
    const path = parsedCollectionPath(collectionPath, pluginModuleConfig)
    const _docId = docId || payload

    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(path, _docId)

    data[path].delete(_docId)
  }
}
