import type { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { isEqual } from '@magnetarjs/utils'
import { objGetOrSet } from 'getorset-anything'
import { isFullString, isNumber, isPlainObject } from 'is-what'
import { throwIfEmulatedError } from '../../helpers/index.js'
import { MakeRestoreBackup, StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin.js'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup,
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig: _pluginModuleConfig,
  }: PluginInsertActionPayload<StorePluginModuleConfig>): ReturnType<PluginInsertAction> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    const collectionMap = objGetOrSet(data, collectionPath, () => new Map())

    const _docId =
      docId ||
      (isFullString(payload['id'])
        ? payload['id']
        : isNumber(payload['id'])
          ? `${payload['id']}`
          : storePluginOptions.generateRandomId())

    if (makeBackup) makeBackup(collectionPath, _docId)

    // get current state
    const currentDoc = collectionMap.get(_docId)
    // if the doc does not exist yet, create it with the incoming payload
    if (!isPlainObject(currentDoc)) {
      collectionMap.set(_docId, payload)
      return {
        id: _docId,
        current: collectionMap.get(_docId),
        diffApplied: collectionMap.get(_docId),
      }
    }
    // shallow merge: set only changed keys; do not delete absent keys
    const diffApplied: Partial<{ [key: string]: unknown }> = {}
    for (const [key, value] of Object.entries(payload)) {
      if (isEqual(currentDoc[key], value)) continue
      diffApplied[key] = value
      currentDoc[key] = value
    }
    return { id: _docId, current: currentDoc, diffApplied }
  }
}
