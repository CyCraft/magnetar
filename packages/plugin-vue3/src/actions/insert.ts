import type { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { isFullString, isNumber } from 'is-what'
import { MakeRestoreBackup, Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  Vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<Vue3StoreModuleConfig>): string {
    const collectionMap = data[collectionPath]

    const _docId =
      docId ||
      (isFullString(payload.id)
        ? payload.id
        : isNumber(payload.id)
        ? `${payload.id}`
        : Vue3StoreOptions.generateRandomId())

    if (makeBackup) makeBackup(collectionPath, _docId)

    // reset the doc to be able to overwrite
    collectionMap.set(_docId, {})
    const docDataToMutate = collectionMap.get(_docId)

    if (!docDataToMutate)
      throw new Error(`Document data not found for id: ${collectionPath} ${_docId}`)

    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return _docId
  }
}
