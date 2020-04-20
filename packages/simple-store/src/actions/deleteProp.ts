import { isArray } from 'is-what'
import pathToProp from 'path-to-prop'
import {
  isCollectionModule,
  PlainObject,
  PluginDeletePropAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deletePropActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function (
    payload: string | string[],
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // `deleteProp` action cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = data[collectionPath]
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
