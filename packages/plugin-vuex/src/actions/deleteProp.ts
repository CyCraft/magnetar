import { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/core'
import {
  VuexStorePluginModuleConfig,
  VuexStorePluginOptions,
  MakeRestoreBackup,
} from '../CreatePlugin'
import { Store } from 'vuex'

export function deletePropActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<VuexStorePluginModuleConfig>): void {
    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    store.commit(`${collectionPath}/${docId}/MAGNETAR__DELETE_PROP`, payload)

    // if (makeBackup) makeBackup(collectionPath, docId)
  }
}
