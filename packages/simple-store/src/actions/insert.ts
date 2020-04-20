import {
  isCollectionModule,
  PlainObject,
  PluginInsertAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions } from '..'
import { isFullString } from 'is-what'
import { MakeRestoreBackup } from '../CreatePlugin'

export function insertActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): string {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    if (isCollection) {
      const docId = isFullString(payload.id) ? payload.id : simpleStoreOptions.generateRandomId()
      const collectionPath = modulePath

      if (makeBackup) makeBackup(collectionPath, docId)

      data[collectionPath].set(docId, payload)
      return docId
    }
    // else it's a doc
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = data[collectionPath]

    if (makeBackup) makeBackup(collectionPath, docId)

    // reset the doc to be able to overwrite
    collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)
    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return docId
  }
}
