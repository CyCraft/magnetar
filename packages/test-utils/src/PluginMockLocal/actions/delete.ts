import { isFullString } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '../../../../core/src'
import { StorePluginModuleConfig, StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin'
import { throwIfEmulatedError } from '../../helpers'

export function deleteActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
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
