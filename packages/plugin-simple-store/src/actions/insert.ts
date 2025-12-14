import type { PluginInsertAction } from '@magnetarjs/types'
import { isEqual } from '@magnetarjs/utils'
import { objGetOrSet } from 'getorset-anything'
import { isFullString, isNumber, isPlainObject } from 'is-what'
import { MakeRestoreBackup, SimpleStoreOptions } from '../CreatePlugin.js'

export function insertActionFactory(
  data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> },
  simpleStoreOptions: SimpleStoreOptions,
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
          : simpleStoreOptions.generateRandomId())

    if (makeBackup) makeBackup(collectionPath, _docId)

    // get current state
    const currentDoc = collectionMap.get(_docId)
    // if the doc does not exist yet, create it with the incoming payload
    if (!isPlainObject(currentDoc)) {
      collectionMap.set(_docId, payload)
      return { id: _docId, current: payload, diffApplied: payload }
    }

    const diffApplied: Partial<{ [key: string]: unknown }> = {}

    // shallow merge: set only changed keys; do not delete absent keys
    for (const [key, value] of Object.entries(payload)) {
      if (isEqual(currentDoc[key], value)) continue
      diffApplied[key] = value
      currentDoc[key] = value
    }
    return { id: _docId, current: currentDoc, diffApplied }
  }
  return insert
}
