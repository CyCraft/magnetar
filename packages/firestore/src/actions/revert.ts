import { PlainObject, ActionName, PluginRevertAction, PluginInstance } from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'

export function revertActionFactory (
  actions: PluginInstance['actions'],
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return async function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    [collectionPath, docId]: [string, string | undefined],
    firestoreModuleConfig: FirestoreModuleConfig,
    actionName: ActionName
  ): Promise<void> {
    // revert all write actions when called on a doc
    // ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    if (docId) {
      if (actionName === 'insert') {
        await actions.delete(undefined, [collectionPath, docId], firestoreModuleConfig)
        return
      }
    }
    // reverting other actions are tricky...

    // insert on collection (no id)
    if (!docId && actionName === 'insert') {
      throw new Error(`revert not yet implemented for insert on collections`)
    }
    throw new Error(
      `revert not yet implemented for ${actionName}. See https://github.com/vue-sync/core/issues/2`
    )
  }
}
