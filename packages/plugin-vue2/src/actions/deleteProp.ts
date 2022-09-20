import { isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { PluginDeletePropAction, PluginDeletePropActionPayload } from '@magnetarjs/types'
import { Vue2StoreModuleConfig, Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin'

export function deletePropActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<Vue2StoreModuleConfig>): void {
    const { vueInstance: vue } = vue2StoreOptions
    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const collectionDic = data[collectionPath]
    const docData = collectionDic[docId]

    if (!docData) throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)

    if (makeBackup) makeBackup(collectionPath, docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      const isNestedPropPath = /[./]/.test(propToDelete)
      if (isNestedPropPath) {
        const parts = propToDelete.split(/[./]/)
        const lastPart = parts.pop()
        const parentRef = getProp(docData, parts.join('.')) as Record<string, any>
        vue.delete(parentRef, lastPart || '')
      } else {
        vue.delete(docData, propToDelete)
      }
    }
  }
}
