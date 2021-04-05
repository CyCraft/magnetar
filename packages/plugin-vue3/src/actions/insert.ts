import { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/core'
import { Vue3StoreModuleConfig, Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { parsedCollectionPath } from '../helpers/pathHelpers'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
  Vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<Vue3StoreModuleConfig>): string {
    const path = parsedCollectionPath(collectionPath, pluginModuleConfig)
    const collectionMap = data[path]

    const _docId =
      docId ||
      (isFullString(payload.id) || isNumber(payload.id)
        ? String(payload.id)
        : Vue3StoreOptions.generateRandomId())

    if (makeBackup) makeBackup(path, _docId)

    // reset the doc to be able to overwrite
    collectionMap.set(_docId, {})
    const docDataToMutate = collectionMap.get(_docId)

    if (!docDataToMutate) throw new Error(`Document data not found for id: ${path} ${_docId}`)

    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return _docId
  }
}
