import { copy } from 'copy-anything'
import { pick } from 'filter-anything'
import { isArray, isNumber, isPlainObject } from 'is-what'
import { mapGetOrSet } from 'getorset-anything'
import {
  PluginInstance,
  MagnetarPlugin,
  Clauses,
  PluginModuleSetupPayload,
  getPathWhereIdentifier,
  PathWhereIdentifier,
} from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { writeActionFactory } from './actions/mergeAssignReplace'
import { insertActionFactory } from './actions/insert'
import { deletePropActionFactory } from './actions/deleteProp'
import { deleteActionFactory } from './actions/delete'
import { fetchActionFactory } from './actions/fetch'
import { streamActionFactory } from './actions/stream'
import { revertActionFactory } from './actions/revert'
import { fetchCountActionFactory } from './actions/fetchCount'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - StorePluginOptions
// - StorePluginModuleConfig

export interface StorePluginOptions {
  generateRandomId: () => string
  storeName: string
}
export interface StorePluginModuleConfig extends Clauses {
  path?: string
  initialData?: Record<string, unknown> | [string, Record<string, unknown>][]
}

export type MakeRestoreBackup = (collectionPath: string, docId: string) => void

// a Magnetar plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Magnetar module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: MagnetarPlugin<StorePluginOptions> = (
  storePluginOptions: StorePluginOptions
): PluginInstance => {
  // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
  // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
  const data: { [collectionPath: string]: Map<string, Record<string, unknown>> } = {}
  const exists: { [docPath: string]: undefined | 'error' | boolean } = {}
  const pathCountDic: { [collectionPath in PathWhereIdentifier]?: number } = {}

  const dataBackups: { [collectionPath: string]: Map<string, Record<string, unknown>[]> } = {}
  const makeBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    if (!(collectionPath in dataBackups)) dataBackups[collectionPath] = new Map()
    const backupCollectionMap = dataBackups[collectionPath]
    // set the backup array for the doc
    const arr = mapGetOrSet(backupCollectionMap, docId, (): Record<string, unknown>[] => [])
    // make a backup of whatever is found in the data
    const foundDoc = data[collectionPath].get(docId)
    if (foundDoc) arr.push(copy(foundDoc))
  }

  const restoreBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    if (!(collectionPath in dataBackups)) return
    const backupCollectionMap = dataBackups[collectionPath]
    // set the backup array for the doc
    if (!backupCollectionMap.has(docId)) return
    const docBackupArray = backupCollectionMap.get(docId)
    if (!docBackupArray || !docBackupArray.length) {
      // the backup was "undefined", so we need to delete it
      data[collectionPath].delete(docId)
      return
    }
    // restore the backup of whatever is found and replace with the data
    const docBackup = docBackupArray.pop()
    if (docBackup) data[collectionPath].set(docId, docBackup)
    // the backup was "undefined", so we need to delete it
    if (docBackup === undefined) data[collectionPath].delete(docId)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  const modulesAlreadySetup = new Set()
  const setupModule = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginModuleSetupPayload<StorePluginModuleConfig>): void => {
    const modulePath = [collectionPath, docId].filter(Boolean).join('/')
    if (modulesAlreadySetup.has(modulePath)) return
    // always set up a new Map for the **collection**, but only when it is still undefined!
    // the reason for this is that the module can be instantiated for multiple documents in the same collection
    if (!(collectionPath in data)) data[collectionPath] = new Map()
    const dataCollectionMap = data[collectionPath]
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
      dataCollectionMap.set(docId, initialData as Record<string, unknown>)
    }
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  const getModuleData = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginModuleSetupPayload<StorePluginModuleConfig>): any => {
    const collectionDB = data[collectionPath]
    // if it's a doc, return the specific doc
    if (docId) return collectionDB.get(docId)
    // if it's a collection, we must return the collectionDB but with applied query clauses
    // but remember, the return type MUST be a map with id as keys and the docs as value
    const clauses: Clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit', 'startAfter'])

    return filterDataPerClauses(collectionDB, clauses)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It should signify wether or not the document exists. Must return `undefined` when not sure (if the document was never fetched). It is triggered EVERY TIME the module's `.data` is accessed.
   */
  const getModuleExists = ({
    collectionPath,
    docId,
  }: Pick<PluginModuleSetupPayload<StorePluginModuleConfig>, 'collectionPath' | 'docId'>): any => {
    return exists[`${collectionPath}/${docId}`]
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's count is accessed.
   */
  const getModuleCount = ({
    collectionPath,
    pluginModuleConfig = {},
  }: Omit<PluginModuleSetupPayload<StorePluginModuleConfig>, 'docId'>): number => {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)
    const count = pathCountDic[pathId]
    if (isNumber(count)) return count

    // if we didn't have any cached count yet, we must return the size of the collectionDB but with applied query clauses
    const clauses: Clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit', 'startAfter'])

    const collectionDB = data[collectionPath]
    const dataFiltered = filterDataPerClauses(collectionDB, clauses)
    return dataFiltered.size
  }

  // the plugin must try to implement logic for every `ActionName`
  const fetch = fetchActionFactory(data, exists, storePluginOptions)
  const fetchCount = fetchCountActionFactory(pathCountDic, storePluginOptions)
  const stream = streamActionFactory(data, storePluginOptions)
  const insert = insertActionFactory(data, storePluginOptions, makeBackup)
  const _merge = writeActionFactory(data, storePluginOptions, 'merge', makeBackup)
  const assign = writeActionFactory(data, storePluginOptions, 'assign', makeBackup)
  const replace = writeActionFactory(data, storePluginOptions, 'replace', makeBackup)
  const deleteProp = deletePropActionFactory(data, storePluginOptions, makeBackup)
  const _delete = deleteActionFactory(data, storePluginOptions, makeBackup)

  const revert = revertActionFactory(data, storePluginOptions, restoreBackup)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    revert,
    actions: {
      fetch,
      fetchCount,
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
  }
  return instance
}
