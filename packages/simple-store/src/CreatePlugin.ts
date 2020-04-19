import { copy } from 'copy-anything'
import {
  PluginInstance,
  VueSyncPlugin,
  PlainObject,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { writeActionFactory } from './actions/mergeAssignReplace'
import { insertActionFactory } from './actions/insert'
import { deletePropActionFactory } from './actions/deleteProp'
import { deleteActionFactory } from './actions/delete'
import { getActionFactory } from './actions/get'
import { streamActionFactory } from './actions/stream'
import { revertActionFactory } from './actions/revert'

// there are two interfaces to be defined & exported by each plugin
// - SimpleStoreConfig
// - StorePluginModuleConfig

export interface SimpleStoreConfig {
  storeName: string
  generateRandomId: () => string
}
export interface StorePluginModuleConfig {
  path?: string
  initialData?: PlainObject | [string, PlainObject][]
}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: VueSyncPlugin<SimpleStoreConfig> = (
  simpleStoreConfig: SimpleStoreConfig
): PluginInstance => {
  // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
  // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
  const data: PlainObject = {}

  // this mocks some sort of data snapshot restore functionality of the plugin
  const dataSnapshots = []
  const makeDataSnapshot = (): void => { dataSnapshots.push(copy(data)) } // prettier-ignore
  const restoreDataSnapshot = (): void => {
    const last = dataSnapshots.pop()
    Object.keys(data.pokedex).forEach(key => delete data.pokedex[key])
    Object.keys(last.pokedex).forEach(key => (data.pokedex[key] = last.pokedex[key]))
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  const modulesAlreadySetup = new Set()
  const setupModule = (modulePath: string, moduleConfig: StorePluginModuleConfig = {}): void => {
    if (modulesAlreadySetup.has(modulePath)) return
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    // always set up a new Map for the collection, but only when it's undefined!
    // the reason for this is that the module can be instantiated multiple times
    data[collectionPath] = data[collectionPath] ?? new Map()
    // then do anything specific for your plugin, like setting initial data
    const { initialData } = moduleConfig
    if (!initialData) return
    if (!docId) {
      for (const [_docId, _docData] of initialData) {
        data[collectionPath].set(_docId, _docData)
      }
    } else {
      data[collectionPath].set(docId, initialData)
    }
    modulesAlreadySetup.add(modulePath)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  const getModuleData = (modulePath: string, moduleConfig: StorePluginModuleConfig = {}): any => {
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionDB = data[collectionPath]
    // if it's a collection, just return the collectionDB, which MUST be a map with id as keys and the docs as value
    if (!docId) return collectionDB
    // if it's a doc, return the specific doc
    return collectionDB.get(docId)
  }

  // the plugin must try to implement logic for every `ActionName`
  const get = getActionFactory(data, simpleStoreConfig, makeDataSnapshot)
  const stream = streamActionFactory(data, simpleStoreConfig, makeDataSnapshot)
  const insert = insertActionFactory(data, simpleStoreConfig, makeDataSnapshot)
  const _merge = writeActionFactory(data, simpleStoreConfig, makeDataSnapshot, 'merge')
  const assign = writeActionFactory(data, simpleStoreConfig, makeDataSnapshot, 'assign')
  const replace = writeActionFactory(data, simpleStoreConfig, makeDataSnapshot, 'replace')
  const deleteProp = deletePropActionFactory(data, simpleStoreConfig, makeDataSnapshot)
  const _delete = deleteActionFactory(data, simpleStoreConfig, makeDataSnapshot)

  const revert = revertActionFactory(data, simpleStoreConfig, restoreDataSnapshot)

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
