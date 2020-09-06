import { PluginRevertAction, PluginInstance, PluginRevertActionPayload } from '@magnetarjs/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'

export function revertActionFactory(
  actions: PluginInstance['actions'],
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginRevertAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
    error,
  }: PluginRevertActionPayload<FirestoreModuleConfig>): Promise<void> {
    // reverting on read actions is not neccesary
    const isReadAction = ['get', 'stream'].includes(actionName)
    if (isReadAction) return
    // revert all write actions when called on a doc
    if (docId) {
      if (actionName === 'insert') {
        if (actions.delete)
          await actions.delete({ payload: undefined, collectionPath, docId, pluginModuleConfig })
        return
      }
    }
    // reverting other actions are tricky...
    // insert on collection (no id)
    if (!docId && actionName === 'insert') actionName = 'insert on collections' as any
    console.error(
      `[@magnetarjs/plugin-firestore] revert not yet implemented for ${actionName}. See https://github.com/cycraft/core/issues/2`
    )
  }
}
