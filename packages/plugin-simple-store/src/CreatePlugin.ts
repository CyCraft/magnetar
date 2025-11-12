import type {
  Clauses,
  MagnetarPlugin,
  PathWhereIdentifier,
  PluginInstance,
  PluginModuleSetupPayload,
} from '@magnetarjs/types'
import { getPathWhereIdentifier } from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { copy } from 'copy-anything'
import { mapGetOrSet, objGetOrSet } from 'getorset-anything'
import { isArray, isNumber, isPlainObject, isString } from 'is-what'
import { deleteActionFactory } from './actions/delete.js'
import { deletePropActionFactory } from './actions/deleteProp.js'
import { fetchActionFactory } from './actions/fetch.js'
import { fetchAggregateActionFactory } from './actions/fetchAggregate.js'
import { fetchCountActionFactory } from './actions/fetchCount.js'
import { insertActionFactory } from './actions/insert.js'
import { writeActionFactory } from './actions/mergeAssignReplace.js'
import { revertActionFactory } from './actions/revert.js'
import { streamActionFactory } from './actions/stream.js'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - SimpleStoreOptions
// - SimpleStoreModuleConfig

export type SimpleStoreOptions = {
  generateRandomId: () => string
}
export type SimpleStoreModuleConfig = {
  path?: string
  initialData?: { [key: string]: unknown } | [string, { [key: string]: unknown }][]
} & Clauses

export type MakeRestoreBackup = (collectionPath: string, docId: string) => void

// a Magnetar plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Magnetar module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: MagnetarPlugin<SimpleStoreOptions> = (
  simpleStoreOptions: SimpleStoreOptions,
): PluginInstance => {
  // this is the cache state of the plugin, each plugin that acts as a "cache Store Plugin" should have something similar
  // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
  const data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> } = {}
  const exists: { [docPath: string]: undefined | 'error' | boolean } = {}
  const pathCountDic: { [pathId in PathWhereIdentifier]?: number } = {}
  const pathSumDic: {
    [pathId in PathWhereIdentifier]?: { [key in string]: number | { [key in string]: unknown } }
  } = {}
  const pathAverageDic: {
    [pathId in PathWhereIdentifier]?: { [key in string]: number | { [key in string]: unknown } }
  } = {}

  const dataBackups: { [collectionPath: string]: Map<string, { [key: string]: unknown }[]> } = {}
  const makeBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    const backupCollectionMap = objGetOrSet(dataBackups, collectionPath, () => new Map())
    // set the backup array for the doc
    const arr = mapGetOrSet(backupCollectionMap, docId, (): { [key: string]: unknown }[] => [])
    // make a backup of whatever is found in the data
    const foundDoc = data[collectionPath]?.get(docId)
    if (foundDoc) arr.push(copy(foundDoc))
  }

  const restoreBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    const backupCollectionMap = dataBackups[collectionPath]
    // set the backup array for the doc
    if (!backupCollectionMap?.has(docId)) return
    const docBackupArray = backupCollectionMap.get(docId)
    if (!docBackupArray || !docBackupArray.length) {
      // the backup was "undefined", so we need to delete it
      data[collectionPath]?.delete(docId)
      return
    }
    // restore the backup of whatever is found and replace with the data
    const docBackup = docBackupArray.pop()
    if (docBackup) data[collectionPath]?.set(docId, docBackup)
    // the backup was "undefined", so we need to delete it
    if (docBackup === undefined) data[collectionPath]?.delete(docId)
  }

  /**
   * This must be provided by Store Plugins that have "cache" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  const modulesAlreadySetup = new Set()
  const setupModule = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginModuleSetupPayload<SimpleStoreModuleConfig>): void => {
    const modulePath = [collectionPath, docId].filter(Boolean).join('/')
    if (modulesAlreadySetup.has(modulePath)) return
    // always set up a new Map for the **collection**, but only when it is still undefined!
    // the reason for this is that the module can be instantiated for multiple documents in the same collection
    if (!(collectionPath in data)) data[collectionPath] = new Map()
    const dataCollectionMap = objGetOrSet(data, collectionPath, () => new Map())
    modulesAlreadySetup.add(modulePath)
    // then do anything specific for your plugin, like setting initial data
    const { initialData } = pluginModuleConfig
    if (!initialData) return
    if (!docId && isArray(initialData)) {
      if (dataCollectionMap.size > 0) return
      for (const [_docId, _docData] of initialData) {
        dataCollectionMap.set(_docId, _docData)
      }
    } else if (docId && isPlainObject(initialData)) {
      if (dataCollectionMap.has(docId)) return
      dataCollectionMap.set(docId, initialData as { [key: string]: unknown })
    }
  }

  /**
   * This must be provided by Store Plugins that have "cache" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  const getModuleData = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginModuleSetupPayload<SimpleStoreModuleConfig>): any => {
    const dataCollectionMap = objGetOrSet(data, collectionPath, () => new Map())
    // if it's a doc, return the specific doc
    if (isString(docId)) return dataCollectionMap.get(docId)
    // if it's a collection, we must return the dataCollectionMap but with applied query clauses
    // but remember, the return type MUST be a map with id as keys and the docs as value
    const clauses: Clauses = pluginModuleConfig
    return filterDataPerClauses(dataCollectionMap, clauses)
  }

  /**
   * This must be provided by Store Plugins that have "cache" data. It should signify wether or not the document exists. Must return `undefined` when not sure (if the document was never fetched). It is triggered EVERY TIME the module's `.data` is accessed.
   */
  const getModuleExists = ({
    collectionPath,
    docId,
  }: Pick<PluginModuleSetupPayload<SimpleStoreModuleConfig>, 'collectionPath' | 'docId'>): any => {
    return exists[`${collectionPath}/${docId}`]
  }

  /**
   * This must be provided by Store Plugins that have "cache" data. It is triggered EVERY TIME the module's count is accessed.
   */
  const getModuleAggregate = (
    kind: 'sum' | 'average',
    {
      collectionPath,
      pluginModuleConfig = {},
    }: Omit<PluginModuleSetupPayload<SimpleStoreModuleConfig>, 'docId'>,
  ): { [key in string]: number | { [key in string]: unknown } } => {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)
    const dic = kind === 'sum' ? pathSumDic[pathId] : pathAverageDic[pathId]
    return dic ?? {}
  }

  /**
   * This must be provided by Store Plugins that have "cache" data. It is triggered EVERY TIME the module's count is accessed.
   */
  const getModuleCount = ({
    collectionPath,
    pluginModuleConfig = {},
  }: Omit<PluginModuleSetupPayload<SimpleStoreModuleConfig>, 'docId'>): number => {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)
    const count = pathCountDic[pathId]
    if (isNumber(count)) return count

    // if we didn't have any cached count yet, we must return the size of the dataCollectionMap but with applied query clauses
    const clauses: Clauses = pluginModuleConfig
    const dataCollectionMap = objGetOrSet(data, collectionPath, () => new Map())
    const dataFiltered = filterDataPerClauses(dataCollectionMap, clauses)
    return dataFiltered.size
  }

  // the plugin must try to implement logic for every `ActionName`
  const fetch = fetchActionFactory(data, exists, simpleStoreOptions)
  const fetchCount = fetchCountActionFactory(pathCountDic, simpleStoreOptions)
  const fetchSum = fetchAggregateActionFactory(pathSumDic, simpleStoreOptions)
  const fetchAverage = fetchAggregateActionFactory(pathAverageDic, simpleStoreOptions)
  const stream = streamActionFactory(data, simpleStoreOptions)
  const insert = insertActionFactory(data, simpleStoreOptions, makeBackup)
  const _merge = writeActionFactory(data, simpleStoreOptions, 'merge', makeBackup)
  const assign = writeActionFactory(data, simpleStoreOptions, 'assign', makeBackup)
  const replace = writeActionFactory(data, simpleStoreOptions, 'replace', makeBackup)
  const deleteProp = deletePropActionFactory(data, simpleStoreOptions, makeBackup)
  const _delete = deleteActionFactory(data, simpleStoreOptions, makeBackup)

  const revert = revertActionFactory(data, simpleStoreOptions, restoreBackup)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    revert,
    actions: {
      fetch,
      fetchCount,
      fetchSum,
      fetchAverage,
      stream,
      insert,
      merge: _merge,
      assign,
      replace,
      deleteProp,
      delete: _delete,
    },
    setupModule,
    getModuleData,
    getModuleExists,
    getModuleCount,
    getModuleAggregate,
  }
  return instance
}
