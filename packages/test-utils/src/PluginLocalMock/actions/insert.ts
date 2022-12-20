import { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { StorePluginModuleConfig, StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { throwIfEmulatedError } from '../../helpers'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, unknown>> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<StorePluginModuleConfig>): string {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    const collectionMap = data[collectionPath]

    const _docId =
      docId ||
      (isFullString(payload.id)
        ? payload.id
        : isNumber(payload.id)
        ? `${payload.id}`
        : storePluginOptions.generateRandomId())

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
