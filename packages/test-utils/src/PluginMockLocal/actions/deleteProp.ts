import { isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/core'
import { SimpleStoreModuleConfig, SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deletePropActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<SimpleStoreModuleConfig>): void {
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
        const parentRef = getProp(docData, parts.join('.')) as Record<string, any>
        delete parentRef[lastPart || '']
      } else {
        delete docData[propToDelete]
      }
    }
  }
}
