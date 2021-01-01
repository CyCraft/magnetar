import { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/core'
import { Vue2StoreModuleConfig, Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  reactiveStoreOptions: Vue2StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  const { generateRandomId, vueInstance } = reactiveStoreOptions
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<Vue2StoreModuleConfig>): string {
    if (!docId) {
      const newDocId =
        isFullString(payload.id) || isNumber(payload.id) ? String(payload.id) : generateRandomId()

      if (makeBackup) makeBackup(collectionPath, newDocId)

      const payloadReactive = vueInstance.observable(payload)
      data[collectionPath].set(newDocId, payloadReactive)
      return newDocId
    }
    // else it's a doc
    const collectionMap = data[collectionPath]

    if (makeBackup) makeBackup(collectionPath, docId)

    const docDataToMutate = collectionMap.get(docId)

    // we're setting a new doc with an id that was passed
    if (!docDataToMutate) {
      const payloadReactive = vueInstance.observable(payload)
      data[collectionPath].set(docId, payloadReactive)
      return docId
    }

    // we're overwriting a doc with a new doc
    // reset the doc to be able to overwrite
    Object.keys(docDataToMutate).forEach((key) => {
      if (key in payload) return
      // delete docDataToMutate[key]
      vueInstance.delete(docDataToMutate, key)
    })
    Object.entries(payload).forEach(([key, value]) => {
      // docDataToMutate[key] = value
      vueInstance.set(docDataToMutate, key, value)
    })
    // console.log(`docDataToMutate.name → `, docDataToMutate.name)
    return docId
  }
}
