import type { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { isFullString, isNumber } from 'is-what'
import { MakeRestoreBackup, SimpleStoreModuleConfig, SimpleStoreOptions } from '../CreatePlugin'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  simpleStoreOptions: SimpleStoreOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<SimpleStoreModuleConfig>): string {
    const collectionMap = data[collectionPath]

    const _docId =
      docId ||
      (isFullString(payload.id)
        ? payload.id
        : isNumber(payload.id)
        ? `${payload.id}`
        : simpleStoreOptions.generateRandomId())

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
