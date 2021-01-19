import {
  PluginActionPayloadBase,
  PluginRevertAction,
  PluginRevertActionPayload,
} from '@magnetarjs/core'
import {
  VuexStorePluginModuleConfig,
  VuexStorePluginOptions,
  MakeRestoreBackup,
} from '../CreatePlugin'
import { Store } from 'vuex'

export function revertActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<VuexStorePluginModuleConfig>): void {
    // revert all write actions when called on a doc
    if (
      docId &&
      ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    ) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    // haven't implemented reverting 'get', 'stream' actions yet
    console.error(`[@magnetarjs/plugin-vuex] revert not yet implemented for ${actionName}`)
  }
}
