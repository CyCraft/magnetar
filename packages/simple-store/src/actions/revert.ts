import {
  PlainObject,
  ActionName,
  PluginRevertAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '..'
import { MakeRestoreBackup } from '../CreatePlugin'

export function revertActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig,
    actionName: ActionName
  ): void {
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    // revert all write actions when called on a doc
    if (
      docId &&
      ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    ) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') {
      throw new Error(`revert not yet implemented for insert on collections`)
    }
    // haven't implemented reverting 'get', 'stream' actions yet
    throw new Error(`revert not yet implemented for ${actionName}`)
  }
}
