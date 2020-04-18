import { merge } from 'merge-anything'
import {
  isCollectionModule,
  PlainObject,
  PluginWriteAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'

export function writeActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot: any,
  actionName: 'merge' | 'assign' | 'replace'
): PluginWriteAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // write actions cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    if (!collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)
    if (actionName === 'merge') {
      Object.entries(payload).forEach(([key, value]) => {
        docDataToMutate[key] = merge(docDataToMutate[key], value)
      })
    }
  }
}
