import { PluginInsertAction, PluginInsertActionPayload } from '../../../../core/src'
import { StorePluginModuleConfig, StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { throwIfEmulatedError } from '../../helpers'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, Record<string, any>> },
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

    if (!docId) {
      const newDocId =
        isFullString(payload.id) || isNumber(payload.id)
          ? String(payload.id)
          : storePluginOptions.generateRandomId()

      if (makeBackup) makeBackup(collectionPath, newDocId)

      data[collectionPath].set(newDocId, payload)
      return newDocId
    }
    // else it's a doc
    const collectionMap = data[collectionPath]

    if (makeBackup) makeBackup(collectionPath, docId)

    // reset the doc to be able to overwrite
    collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)

    if (!docDataToMutate)
      throw new Error(`Document data not found for id: ${collectionPath} ${docId}`)

    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return docId
  }
}
