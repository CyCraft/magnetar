import type { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/types'
import { isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { MakeRestoreBackup, Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin'

export function deletePropActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  Vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<Vue3StoreModuleConfig>): void {
    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const collectionMap = data[collectionPath]
    const docData = collectionMap.get(docId)

    if (!docData) throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)

    if (makeBackup) makeBackup(collectionPath, docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      const isNestedPropPath = /[./]/.test(propToDelete)
      if (isNestedPropPath) {
        const parts = propToDelete.split(/[./]/)
        const lastPart = parts.pop()
        const parentRef = getProp(docData, parts.join('.')) as Record<string, unknown>
        delete parentRef[lastPart || '']
      } else {
        delete docData[propToDelete]
      }
    }
  }
}
