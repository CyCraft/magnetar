import { isArray, isString } from 'is-what'
import {
  PlainObject,
  ActionName,
  PluginRevertAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'

export function revertActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  restoreDataSnapshot: any
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    actionName: ActionName
  ): void {
    // this is custom logic to be implemented by the plugin author
    if (!payload) return
    // strings are only possible during deletions
    // haven't implemented reverting deletions yet
    if (isString(payload) || (isArray(payload) && isString(payload[0]))) return
    // this mocks data reverted during a read
    if (actionName === 'get' || actionName === 'stream') {
      restoreDataSnapshot()
      return
    }
    // this mocks data reverted during a write
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    if (!docId) {
      // collection
      throw new Error(
        `revert not yet implemented for insert on collection - payload: ${JSON.stringify(payload)}`
      )
    }
    if (actionName === 'insert') {
      collectionMap.delete(docId)
      return
    }
    throw new Error('revert not yet implemented for this action')
  }
}
