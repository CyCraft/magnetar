import { isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/core'
import { Vue3StoreModuleConfig, Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { parsedCollectionPath } from '../helpers/pathHelpers'

export function deletePropActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
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

    const path = parsedCollectionPath(collectionPath, pluginModuleConfig)
    const collectionMap = data[path]
    const docData = collectionMap.get(docId)

    if (!docData) throw new Error(`Document data not found for id: ${path} ${docId}`)

    if (makeBackup) makeBackup(path, docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      const isNestedPropPath = /[./]/.test(propToDelete)
      if (isNestedPropPath) {
        const parts = propToDelete.split(/[./]/)
        const lastPart = parts.pop()
        const parentRef = getProp(docData, parts.join('.')) as Record<string, any>
        delete parentRef[lastPart || '']
      } else {
        delete docData[propToDelete]
      }
    }
  }
}
