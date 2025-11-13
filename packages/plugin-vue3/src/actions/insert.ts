import type { PluginInsertAction, PluginInsertActionPayload } from '@magnetarjs/types'
import { objGetOrSet } from 'getorset-anything'
import { isArray, isFullString, isNumber, isPlainObject } from 'is-what'
import { MakeRestoreBackup, Vue3StoreModuleConfig, Vue3StoreOptions } from '../CreatePlugin.js'

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
  vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup,
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<Vue3StoreModuleConfig>): string {
    const collectionMap = objGetOrSet(data, collectionPath, () => new Map())

    const _docId =
      docId ||
      (isFullString(payload['id'])
        ? payload['id']
        : isNumber(payload['id'])
          ? `${payload['id']}`
          : vue3StoreOptions.generateRandomId())

    if (makeBackup) makeBackup(collectionPath, _docId)

    // get current state
    const currentDoc = collectionMap.get(_docId)
    // if the doc does not exist yet, create it with the incoming payload
    if (!isPlainObject(currentDoc)) {
      collectionMap.set(_docId, payload)
      return _docId
    }
    // delete keys that no longer exist
    Object.keys(currentDoc).forEach((key) => {
      if (!(key in payload)) {
        Reflect.deleteProperty(currentDoc, key)
      }
    })
    // set only changed keys that already exist locally; drop brand-new keys
    Object.entries(payload).forEach(([key, value]) => {
      if (key in currentDoc && !isEqual(currentDoc[key], value)) {
        currentDoc[key] = value
      }
    })
    return _docId
  }
}
