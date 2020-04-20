import {
  isCollectionModule,
  PlainObject,
  PluginDeleteAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deleteActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function (
    payload: void,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): void {
    const isCollection = isCollectionModule(modulePath)
    // delete cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    if (makeBackup) makeBackup(collectionPath, docId)

    data[collectionPath].delete(docId)
  }
}
