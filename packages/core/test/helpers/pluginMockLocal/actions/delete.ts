import { PlainObject, PluginDeleteAction } from '../../../../src'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { throwIfEmulatedError } from '../../throwFns'

export function deleteActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function (
    payload: void,
    [collectionPath, docId]: [string, string | undefined],
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, simpleStoreOptions)

    // this is custom logic to be implemented by the plugin author

    // delete cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    if (makeBackup) makeBackup(collectionPath, docId)

    data[collectionPath].delete(docId)
  }
}
