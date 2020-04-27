import { isArray } from 'is-what'
import pathToProp from 'path-to-prop'
import { PlainObject, PluginDeletePropAction } from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { throwIfEmulatedError } from '../../throwFns'

export function deletePropActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function (
    payload: string | string[],
    [collectionPath, docId]: [string, string | undefined],
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

    // this is custom logic to be implemented by the plugin author

    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

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
