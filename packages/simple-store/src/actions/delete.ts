import {
  isCollectionModule,
  PlainObject,
  PluginDeleteAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'
import { MakeRestoreBackup } from '../CreatePlugin'

export function deleteActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function (
    payload: void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // delete cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    if (makeBackup) makeBackup(collectionPath, docId)

    moduleData[collectionPath].delete(docId)
  }
}
