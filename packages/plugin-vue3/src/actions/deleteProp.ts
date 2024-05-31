import type { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/types'
import { objGetOrSet } from 'getorset-anything'
import { isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { MakeRestoreBackup, Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin.js'

export function deletePropActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  Vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<Vue3StoreModuleConfig>): undefined {
    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const collectionMap = objGetOrSet(data, collectionPath, () => new Map())
    const docData = collectionMap.get(docId)

    if (!docData) throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)

    if (makeBackup) makeBackup(collectionPath, docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      const isNestedPropPath = /[./]/.test(propToDelete)
      if (isNestedPropPath) {
        const parts = propToDelete.split(/[./]/)
        const lastPart = parts.pop()
        const parentRef = getProp(docData, parts.join('.')) as { [key: string]: unknown }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete parentRef[lastPart || '']
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete docData[propToDelete]
      }
    }
  }
}
