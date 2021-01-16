import { isFullString } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deleteActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<Vue2StoreModuleConfig>): void {
    const { vueInstance: vue } = vue2StoreOptions

    const _docId = docId || payload
    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    if (makeBackup) makeBackup(collectionPath, _docId)

    vue.delete(data[collectionPath], _docId)
  }
}
