import type { PluginWriteAction } from '@magnetarjs/types'
import { isEqual } from '@magnetarjs/utils'
import { objGetOrSet } from 'getorset-anything'
import { isPlainObject } from 'is-what'
import { merge } from 'merge-anything'
import { throwIfEmulatedError } from '../../helpers/index.js'
import { MakeRestoreBackup, StorePluginOptions } from '../CreatePlugin.js'

export function writeActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  storePluginOptions: StorePluginOptions,
  actionName: 'merge' | 'assign' | 'replace',
  makeBackup?: MakeRestoreBackup,
): PluginWriteAction {
  const write: PluginWriteAction = ({ payload, collectionPath, docId, pluginModuleConfig }) => {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    // write actions cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const collectionMap = objGetOrSet(data, collectionPath, () => new Map())

    if (makeBackup) makeBackup(collectionPath, docId)

    // always start from an empty document on 'replace' or when the doc is non existent
    if (actionName === 'replace' || !collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)

    if (!docDataToMutate) {
      throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)
    }

    const diffApplied: Partial<{ [key: string]: unknown }> = {}

    if (actionName === 'merge') {
      for (const [key, value] of Object.entries(payload)) {
        const originalValue = docDataToMutate[key]
        if (isEqual(originalValue, value)) continue
        if (isPlainObject(originalValue) && isPlainObject(value)) {
          const newVal = merge(originalValue, value)
          diffApplied[key] = newVal
          docDataToMutate[key] = newVal
        } else {
          diffApplied[key] = value
          docDataToMutate[key] = value
        }
      }
    }
    if (actionName === 'assign' || actionName === 'replace') {
      for (const [key, value] of Object.entries(payload)) {
        if (isEqual(docDataToMutate[key], value)) continue
        diffApplied[key] = value
        docDataToMutate[key] = value
      }
    }
    return { id: docId, current: docDataToMutate, diffApplied }
  }
  return write
}
