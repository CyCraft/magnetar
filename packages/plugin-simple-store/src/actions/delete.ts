import type { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/types'
import { isFullString } from 'is-what'
import { MakeRestoreBackup, SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin.js'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<SimpleStoreModuleConfig>): undefined {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    data[collectionPath]?.delete(_docId)
  }
}
