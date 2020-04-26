import {
  PlainObject,
  ActionName,
  PluginRevertAction,
  getCollectionPathDocIdEntry,
  PluginInstance,
} from '@vue-sync/core'
import { FirestoreModuleConfig, FirestorePluginOptions } from '../CreatePlugin'

export function revertActionFactory (
  actions: PluginInstance['actions'],
  firestorePluginOptions: Required<FirestorePluginOptions>
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    firestoreModuleConfig: FirestoreModuleConfig,
    actionName: ActionName
  ): void {
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    // revert all write actions when called on a doc
    // ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    if (docId) {
      if (actionName === 'insert') {
        actions.delete(undefined, modulePath, firestoreModuleConfig)
        return
      }
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') {
      throw new Error(`revert not yet implemented for insert on collections`)
    }
    // haven't implemented reverting 'get', 'stream' actions yet
    throw new Error(`revert not yet implemented for ${actionName}`)
  }
}
