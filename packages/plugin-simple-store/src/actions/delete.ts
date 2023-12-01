import type { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/types'
import { isFullString } from 'is-what'
import { MakeRestoreBackup, SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<SimpleStoreModuleConfig>): void {
    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    data[collectionPath].delete(_docId)
  }
}
