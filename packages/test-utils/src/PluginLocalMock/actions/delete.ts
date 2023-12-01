import type { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/types'
import { isFullString } from 'is-what'
import { throwIfEmulatedError } from '../../helpers'
import { MakeRestoreBackup, StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<StorePluginModuleConfig>): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    data[collectionPath].delete(_docId)
  }
}
