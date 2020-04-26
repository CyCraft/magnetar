import { copy } from 'copy-anything'
import { pick } from 'filter-anything'
import { isArray } from 'is-what'
import {
  PluginInstance,
  VueSyncPlugin,
  PlainObject,
  getCollectionPathDocIdEntry,
  Clauses,
  WhereClause,
  OrderBy,
  Limit,
} from '@vue-sync/core'
import { writeActionFactory } from './actions/mergeAssignReplace'
import { insertActionFactory } from './actions/insert'
import { deletePropActionFactory } from './actions/deleteProp'
import { deleteActionFactory } from './actions/delete'
import { getActionFactory } from './actions/get'
import { streamActionFactory } from './actions/stream'
import { revertActionFactory } from './actions/revert'
import { filterDataPerClauses } from './helpers/dataHelpers'

// there are two interfaces to be defined & exported by each plugin
// - SimpleStoreOptions
// - SimpleStoreModuleConfig

export interface SimpleStoreOptions {
  storeName: string
  generateRandomId: () => string
}
export interface SimpleStoreModuleConfig {
  path?: string
  initialData?: PlainObject | [string, PlainObject][]
  where?: WhereClause[]
  orderBy?: OrderBy[]
  limit?: Limit
}

export type MakeRestoreBackup = (collectionPath: string, docId: string) => void

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: VueSyncPlugin<SimpleStoreOptions> = (
  simpleStoreOptions: SimpleStoreOptions
): PluginInstance => {
  // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
  // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
  const data: { [collectionPath: string]: Map<string, PlainObject> } = {}

  const dataBackups: { [collectionPath: string]: Map<string, PlainObject[]> } = {}
  const makeBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    if (!(collectionPath in dataBackups)) dataBackups[collectionPath] = new Map()
    const backupCollectionMap = dataBackups[collectionPath]
    // set the backup array for the doc
    if (!backupCollectionMap.has(docId)) backupCollectionMap.set(docId, [])
    // make a backup of whatever is found in the data
    const docBackup = copy(data[collectionPath].get(docId))
    backupCollectionMap.get(docId).push(docBackup)
  }

  const restoreBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    if (!(collectionPath in dataBackups)) return
    const backupCollectionMap = dataBackups[collectionPath]
    // set the backup array for the doc
    if (!backupCollectionMap.has(docId)) return
    const docBackupArray = backupCollectionMap.get(docId)
    if (!docBackupArray.length) return
    // restore the backup of whatever is found and replace with the data
    const docBackup = docBackupArray.pop()
    data[collectionPath].set(docId, docBackup)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  const modulesAlreadySetup = new Set()
  const setupModule = (
    [collectionPath, docId]: [string, string | undefined],
    moduleConfig: SimpleStoreModuleConfig = {}
  ): void => {
    const modulePath = [collectionPath, docId].filter(Boolean).join('/')
    if (modulesAlreadySetup.has(modulePath)) return
    // always set up a new Map for the collection, but only when it's undefined!
    // the reason for this is that the module can be instantiated multiple times
    data[collectionPath] = data[collectionPath] ?? new Map()
    // then do anything specific for your plugin, like setting initial data
    const { initialData } = moduleConfig
    if (!initialData) return
    if (!docId && isArray(initialData)) {
      for (const [_docId, _docData] of initialData) {
        data[collectionPath].set(_docId, _docData)
      }
    } else {
      data[collectionPath].set(docId, initialData as PlainObject)
    }
    modulesAlreadySetup.add(modulePath)
  }

  /**
   * Queried local data stored in weakmaps "per query" for the least CPU cycles and preventing memory leaks
   */
  const queriedData: WeakMap<Clauses, Map<string, PlainObject>> = new WeakMap()

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  const getModuleData = (
    [collectionPath, docId]: [string, string | undefined],
    moduleConfig: SimpleStoreModuleConfig = {}
  ): any => {
    const collectionDB = data[collectionPath]
    // if it's a doc, return the specific doc
    if (docId) return collectionDB.get(docId)
    // if it's a collection, we must return the collectionDB but with applied query clauses
    // but remember, the return type MUST be a map with id as keys and the docs as value
    const clauses = pick(moduleConfig, ['where', 'orderBy', 'limit'])
    // return from cache
    if (queriedData.has(clauses)) return queriedData.get(clauses)
    // otherwise create a new filter and return that
    const filteredMap = filterDataPerClauses(collectionDB, clauses)
    queriedData.set(clauses, filteredMap)
    return filteredMap
  }

  // the plugin must try to implement logic for every `ActionName`
  const get = getActionFactory(data, simpleStoreOptions)
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
      get,
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
  }
  return instance
}
