import type {
  PluginInstance,
  PluginRevertAction,
  PluginRevertActionPayload,
} from '@magnetarjs/types'
import { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'
import { FirestoreAdminPluginOptions } from '../CreatePlugin'

export function revertActionFactory(
  actions: PluginInstance['actions'],
  firestorePluginOptions: Required<FirestoreAdminPluginOptions>
): PluginRevertAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    actionConfig,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<FirestoreModuleConfig>): Promise<void> {
    // reverting on read actions is not neccesary
    const isReadAction = ['fetch', 'stream'].includes(actionName)
    if (isReadAction) return
    // revert all write actions when called on a doc
    if (docId) {
      if (actionName === 'insert') {
        if (actions.delete)
          await actions.delete({
            payload: undefined,
            collectionPath,
            docId,
            actionConfig,
            pluginModuleConfig,
          })
        return
      }
    }
    // other actions don't need revert
  }
}
