import type { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { objGetOrSet } from 'getorset-anything'
import { isArray, isFullString, isNumber, isPlainObject } from 'is-what'
import { throwIfEmulatedError } from '../../helpers/index.js'
import { MakeRestoreBackup, StorePluginModuleConfig, StorePluginOptions } from '../CreatePlugin.js'

function isEqual(a: unknown, b: unknown): boolean {
  if (isArray(a) && isArray(b)) {
    return a.length === b.length && a.every((item, index) => isEqual(item, b[index]))
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    return aKeys.length === bKeys.length && aKeys.every((key) => isEqual(a[key], b[key]))
  }
  return a === b
}

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
  }: PluginInsertActionPayload<StorePluginModuleConfig>): string {
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
      return _docId
    }
    // shallow merge: set only changed keys; do not delete absent keys
    Object.entries(payload).forEach(([key, value]) => {
      if (!isEqual(currentDoc[key], value)) {
        currentDoc[key] = value
      }
    })
    return _docId
  }
}
