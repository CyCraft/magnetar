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
import { objectToMap } from './helpers/dataHelpers'
import { fetchCountActionFactory } from './actions/fetchCount'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - Vue2StoreOptions
// - Vue2StoreModuleConfig

export interface Vue2StoreOptions {
  /**
   * This is required to make sure there are not two instances of Vue running which can cause issues.
   */
  vueInstance: any
  /**
   * To support optimistic UI you need to provide a function that can generate unique IDs.
   * @example () => firestore.collection('random').doc().id
   */
  generateRandomId: () => string
}

export interface Vue2StoreModuleConfig extends Clauses {
  path?: string
  initialData?: Record<string, unknown> | [string, Record<string, unknown>][]
}

export type MakeRestoreBackup = (collectionPath: string, docId: string) => void

/**
 * a Magnetar plugin is a single function that returns a `PluginInstance`
 * the plugin implements the logic for all actions that a can be called from a Magnetar module instance
 * each action must have the proper for both collection and doc type modules
 */
export const CreatePlugin: MagnetarPlugin<Vue2StoreOptions> = (
  vue2StoreOptions: Vue2StoreOptions
): PluginInstance => {
  const { vueInstance: vue } = vue2StoreOptions
  // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
  // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
  const data: { [collectionPath: string]: Record<string, Record<string, unknown>> } =
    vue.observable({})
  const pathCountDic: { [collectionPath in PathWhereIdentifier]?: number } = vue.observable({})

  const dataBackups: { [collectionPath: string]: Map<string, Record<string, unknown>[]> } = {}
  const makeBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // set the backup map for the collection
    if (!(collectionPath in dataBackups)) dataBackups[collectionPath] = new Map()
    const backupCollectionMap = dataBackups[collectionPath]
    // set the backup array for the doc
    const arr = mapGetOrSet(backupCollectionMap, docId, (): Record<string, unknown>[] => [])
    // make a backup of whatever is found in the data
    const foundDoc = data[collectionPath][docId]
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
      vue.delete(data[collectionPath], docId)
      return
    }
    // restore the backup of whatever is found and replace with the data
    const docBackup = docBackupArray.pop()
    if (docBackup) vue.set(data[collectionPath], docId, docBackup)
    // the backup was "undefined", so we need to delete it
    if (docBackup === undefined) vue.delete(data[collectionPath], docId)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  const modulesAlreadySetup = new Set()
  const setupModule = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginModuleSetupPayload<Vue2StoreModuleConfig>): void => {
    const modulePath = [collectionPath, docId].filter(Boolean).join('/')
    if (modulesAlreadySetup.has(modulePath)) return
    // always set up a new Map for the **collection**, but only when it is still undefined!
    // the reason for this is that the module can be instantiated for multiple documents in the same collection
    if (!(collectionPath in data)) vue.set(data, collectionPath, {})
    const dataCollectionDic = data[collectionPath]
    modulesAlreadySetup.add(modulePath)
    // then do anything specific for your plugin, like setting initial data
    const { initialData } = pluginModuleConfig
    if (!initialData) return
    if (!docId && isArray(initialData)) {
      if (Object.keys(dataCollectionDic).length > 0) return
      for (const [_docId, _docData] of initialData) {
        vue.set(dataCollectionDic, _docId, _docData)
      }
    } else if (docId && isPlainObject(initialData)) {
      if (docId in dataCollectionDic) return
      vue.set(dataCollectionDic, docId, initialData as Record<string, unknown>)
    }
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  const getModuleData = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginModuleSetupPayload<Vue2StoreModuleConfig>): any => {
    const dataCollectionDic = data[collectionPath]
    // if it's a doc, return the specific doc
    if (docId) return dataCollectionDic[docId]
    // if it's a collection, we must return the dataCollectionDic but with applied query clauses
    // but remember, the return type MUST be a map with id as keys and the docs as value
    const clauses: Clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit', 'startAfter'])

    const result = filterDataPerClauses(new Map(Object.entries(dataCollectionDic)), clauses)
    const resultEntries = [...result.entries()]
    const resultAsDic = Object.fromEntries(resultEntries)

    return objectToMap(resultAsDic, dataCollectionDic, resultEntries)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's count is accessed.
   */
  const getModuleCount = ({
    collectionPath,
    pluginModuleConfig = {},
  }: Omit<PluginModuleSetupPayload<Vue2StoreModuleConfig>, 'docId'>): number => {
    const pathId = getPathWhereIdentifier(collectionPath, pluginModuleConfig)
    const count = pathCountDic[pathId]
    if (isNumber(count)) return count

    // if we didn't have any cached count yet, we must return the size of the collectionDB but with applied query clauses
    const clauses: Clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit', 'startAfter'])

    const collectionDB = data[collectionPath]
    const dataFiltered = filterDataPerClauses(new Map(Object.entries(collectionDB)), clauses)
    return dataFiltered.size
  }

  // the plugin must try to implement logic for every `ActionName`
  const fetch = fetchActionFactory(data, vue2StoreOptions)
  const fetchCount = fetchCountActionFactory(pathCountDic, vue2StoreOptions)
  const stream = streamActionFactory(data, vue2StoreOptions)
  const insert = insertActionFactory(data, vue2StoreOptions, makeBackup)
  const _merge = writeActionFactory(data, vue2StoreOptions, 'merge', makeBackup)
  const assign = writeActionFactory(data, vue2StoreOptions, 'assign', makeBackup)
  const replace = writeActionFactory(data, vue2StoreOptions, 'replace', makeBackup)
  const deleteProp = deletePropActionFactory(data, vue2StoreOptions, makeBackup)
  const _delete = deleteActionFactory(data, vue2StoreOptions, makeBackup)

  const revert = revertActionFactory(data, vue2StoreOptions, restoreBackup)

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
    getModuleCount,
  }
  return instance
}
