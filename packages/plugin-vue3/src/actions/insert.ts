import type { PluginInsertAction } from '@magnetarjs/types'
import { isEqual } from '@magnetarjs/utils'
import { objGetOrSet } from 'getorset-anything'
import { isFullString, isNumber, isPlainObject } from 'is-what'
import { MakeRestoreBackup, Vue3StoreOptions } from '../CreatePlugin.js'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  vue3StoreOptions: Vue3StoreOptions,
  makeBackup?: MakeRestoreBackup,
): PluginInsertAction {
  const insert: PluginInsertAction = ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig: _pluginModuleConfig,
  }) => {
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
      // Return diff as the entire payload since doc didn't exist
      return { id: _docId, current: payload, diffApplied: payload }
    }

    // Calculate diff: only changed keys that already exist locally
    const diffApplied: Partial<{ [key: string]: unknown }> = {}
    for (const [key, value] of Object.entries(payload)) {
      if (isEqual(currentDoc[key], value)) continue
      diffApplied[key] = value
      currentDoc[key] = value
    }
    return { id: _docId, current: currentDoc, diffApplied }
  }
  return insert
}
