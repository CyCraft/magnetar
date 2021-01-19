import { isFullString } from 'is-what'
import { PluginDeleteAction, PluginDeleteActionPayload } from '@magnetarjs/core'
import {
  VuexStorePluginModuleConfig,
  VuexStorePluginOptions,
  MakeRestoreBackup,
} from '../CreatePlugin'
import { Store } from 'vuex'

export function deleteActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<VuexStorePluginModuleConfig>): void {
    const _docId = docId || payload

    if (!isFullString(_docId)) throw new Error('No ID passed to delete action.')

    // if (makeBackup) makeBackup(collectionPath, _docId)

    const modulePath = `${collectionPath}/${_docId}`
    store.unregisterModule(modulePath.split('/'))
  }
}
