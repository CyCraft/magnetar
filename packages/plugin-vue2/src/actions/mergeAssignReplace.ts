import type { PluginWriteAction, PluginWriteActionPayload } from '@magnetarjs/types'
import { isPlainObject } from 'is-what'
import { merge } from 'merge-anything'
import { MakeRestoreBackup, Vue2StoreModuleConfig, Vue2StoreOptions } from '../CreatePlugin'

export function writeActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, unknown>> },
  vue2StoreOptions: Vue2StoreOptions,
  actionName: 'merge' | 'assign' | 'replace',
  makeBackup?: MakeRestoreBackup
): PluginWriteAction {
  const { vueInstance: vue } = vue2StoreOptions
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginWriteActionPayload<Vue2StoreModuleConfig>): void {
    // write actions cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const collectionDic = data[collectionPath]

    if (makeBackup) makeBackup(collectionPath, docId)

    // always start from an empty document on 'replace' or when the doc is non existent
    if (actionName === 'replace' || !collectionDic[docId]) {
      vue.set(collectionDic, docId, {})
    }
    const docDataToMutate = collectionDic[docId]

    if (!docDataToMutate)
      throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)

    if (actionName === 'merge') {
      Object.entries(payload).forEach(([key, value]) => {
        const originalValue = docDataToMutate[key]
        if (isPlainObject(originalValue) && isPlainObject(value)) {
          vue.set(docDataToMutate, key, merge(originalValue, value))
        } else {
          vue.set(docDataToMutate, key, value)
        }
      })
    }
    if (actionName === 'assign' || actionName === 'replace') {
      Object.entries(payload).forEach(([key, value]) => {
        vue.set(docDataToMutate, key, value)
      })
    }
  }
}
