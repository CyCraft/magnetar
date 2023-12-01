import type { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/types'
import { isFullString } from 'is-what'
import { MakeRestoreBackup, Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  Vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<Vue3StoreModuleConfig>): void {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    data[collectionPath].delete(_docId)
  }
}
