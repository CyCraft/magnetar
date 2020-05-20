import { merge } from 'merge-anything'
import { PlainObject, PluginWriteAction, PluginWriteActionPayload } from '@vue-sync/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function writeActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: SimpleStoreOptions,
  actionName: 'merge' | 'assign' | 'replace',
  makeBackup?: MakeRestoreBackup
): PluginWriteAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginWriteActionPayload<SimpleStoreModuleConfig>): void {
    // write actions cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const collectionMap = data[collectionPath]

    if (makeBackup) makeBackup(collectionPath, docId)

    // always start from an empty document on 'replace' or when the doc is non existent
    if (actionName === 'replace' || !collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)

    if (actionName === 'merge') {
      Object.entries(payload).forEach(([key, value]) => {
        docDataToMutate[key] = merge(docDataToMutate[key], value)
      })
    }
    if (actionName === 'assign' || actionName === 'replace') {
      Object.entries(payload).forEach(([key, value]) => {
        docDataToMutate[key] = value
      })
    }
  }
}
