import { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { Vue2StoreModuleConfig, Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'

export function insertActionFactory(
  data: { [collectionPath: string]: Record<string, Record<string, any>> },
  vue2StoreOptions: Vue2StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  const { generateRandomId, vueInstance: vue } = vue2StoreOptions
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<Vue2StoreModuleConfig>): string {
    const collectionDic = data[collectionPath]

    const _docId =
      docId ||
      (isFullString(payload.id) || isNumber(payload.id) ? String(payload.id) : generateRandomId())

    if (makeBackup) makeBackup(collectionPath, _docId)

    const docDataToMutate = collectionDic[_docId]

    // we're setting a new doc
    if (!docDataToMutate) {
      vue.set(collectionDic, _docId, payload)
      return _docId
    }

    // we're overwriting a doc with a new doc
    Object.entries(payload).forEach(([key, value]) => {
      vue.set(docDataToMutate, key, value)
    })
    return _docId
  }
}
