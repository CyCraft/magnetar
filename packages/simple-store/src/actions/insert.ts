import {
  isCollectionModule,
  PlainObject,
  PluginInsertAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'
import { isFullString } from 'is-what'
import { MakeRestoreBackup } from '../CreatePlugin'

export function insertActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): string {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    if (isCollection) {
      const docId = isFullString(payload.id) ? payload.id : simpleStoreConfig.generateRandomId()
      const collectionPath = modulePath

      if (makeBackup) makeBackup(collectionPath, docId)

      moduleData[collectionPath].set(docId, payload)
      return docId
    }
    // else it's a doc
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]

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
