import { PlainObject, ActionName, PluginRevertAction } from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { throwIfEmulatedError } from '../../throwFns'

export function revertActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    [collectionPath, docId]: [string, string | undefined],
    simpleStoreModuleConfig: SimpleStoreModuleConfig,
    actionName: ActionName
  ): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

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
