import { isArray } from 'is-what'
import {
  isCollectionModule,
  PlainObject,
  PluginDeletePropAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'

export function deletePropActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot: any
): PluginDeletePropAction {
  return function (
    payload: string | string[],
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // `deleteProp` action cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    const docData = collectionMap.get(docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      delete docData[propToDelete]
    }
  }
}
