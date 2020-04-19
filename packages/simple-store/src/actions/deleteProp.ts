import { isArray } from 'is-what'
import pathToProp from 'path-to-prop'
import {
  isCollectionModule,
  PlainObject,
  PluginDeletePropAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'
import { MakeRestoreBackup } from '../CreatePlugin'

export function deletePropActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeBackup?: MakeRestoreBackup
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

    if (makeBackup) makeBackup(collectionPath, docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      const isNestedPropPath = /[./]/.test(propToDelete)
      if (isNestedPropPath) {
        const parts = propToDelete.split(/[./]/)
        const lastPart = parts.pop()
        const parentRef = pathToProp(docData, parts.join('.'))
        delete parentRef[lastPart]
      } else {
        delete docData[propToDelete]
      }
    }
  }
}
