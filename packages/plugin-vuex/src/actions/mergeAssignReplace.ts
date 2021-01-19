import {
  PluginActionPayloadBase,
  PluginWriteAction,
  PluginWriteActionPayload,
} from '@magnetarjs/core'
import {
  VuexStorePluginModuleConfig,
  VuexStorePluginOptions,
  MakeRestoreBackup,
} from '../CreatePlugin'
import { Store } from 'vuex'

export function writeActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists',
  actionName: 'merge' | 'assign' | 'replace',
  makeBackup?: MakeRestoreBackup
): PluginWriteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginWriteActionPayload<VuexStorePluginModuleConfig>): void {
    // write actions cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    // if (makeBackup) makeBackup(collectionPath, docId)

    if (actionName === 'replace') {
      store.commit(`${collectionPath}/${docId}/MAGNETAR__REPLACE`, payload)
    }
    if (actionName === 'merge') {
      store.commit(`${collectionPath}/${docId}/MAGNETAR__MERGE`, payload)
    }
    if (actionName === 'assign') {
      store.commit(`${collectionPath}/${docId}/MAGNETAR__ASSIGN`, payload)
    }
  }
}
