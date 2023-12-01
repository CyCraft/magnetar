import type { PluginWriteAction, PluginWriteActionPayload } from '@magnetarjs/types'
import { isPlainObject } from 'is-what'
import { merge } from 'merge-anything'
import { MakeRestoreBackup, SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'

export function writeActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
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

    if (!docDataToMutate)
      throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)

    if (actionName === 'merge') {
      Object.entries(payload).forEach(([key, value]) => {
        const originalValue = docDataToMutate[key]
        if (isPlainObject(originalValue) && isPlainObject(value)) {
          docDataToMutate[key] = merge(originalValue, value)
        } else {
          docDataToMutate[key] = value
        }
      })
    }
    if (actionName === 'assign' || actionName === 'replace') {
      Object.entries(payload).forEach(([key, value]) => {
        docDataToMutate[key] = value
      })
    }
  }
}
