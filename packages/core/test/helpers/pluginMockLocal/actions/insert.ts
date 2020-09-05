import {
  isCollectionModule,
  PlainObject,
  PluginInsertAction,
  getCollectionPathDocIdEntry,
} from '../../../../src'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { throwIfEmulatedError } from '../../throwFns'

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
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    if (isCollection) {
      const docId =
        isFullString(payload.id) || isNumber(payload.id)
          ? String(payload.id)
          : simpleStoreOptions.generateRandomId()
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
