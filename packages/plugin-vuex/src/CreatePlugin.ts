import { copy } from 'copy-anything'
import { pick } from 'filter-anything'
import { merge } from 'merge-anything'
import { isAnyObject, isFullString } from 'is-what'
import { getProp } from 'path-to-prop'
import { Store, GetterTree, MutationTree, ActionTree } from 'vuex'
import {
  PluginInstance,
  MagnetarPlugin,
  Clauses,
  WhereClause,
  OrderByClause,
  Limit,
  PluginActionPayloadBase,
} from '@magnetarjs/core'
import { writeActionFactory } from './actions/mergeAssignReplace'
import { insertActionFactory } from './actions/insert'
import { deletePropActionFactory } from './actions/deleteProp'
import { deleteActionFactory } from './actions/delete'
import { getActionFactory } from './actions/get'
import { streamActionFactory } from './actions/stream'
import { revertActionFactory } from './actions/revert'
import { filterDataPerClauses, objectToMap } from './helpers/dataHelpers'
import { docMutations } from './helpers/mutations'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - VuexStorePluginOptions
// - VuexStorePluginModuleConfig

export interface VuexStorePluginOptions {
  store: Store<Record<string, any>>
  generateRandomId: () => string
}

export interface VuexStorePluginModuleConfig {
  path?: string
  state?: Record<string, any>
  mutations?: MutationTree<Record<string, any>>
  actions?: ActionTree<Record<string, any>, Record<string, any>>
  getters?: GetterTree<Record<string, any>, Record<string, any>>
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
}

export type MakeRestoreBackup = (collectionPath: string, docId: string) => void

// a Magnetar plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Magnetar module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: MagnetarPlugin<VuexStorePluginOptions> = (
  vuexStorePluginOptions: VuexStorePluginOptions
): PluginInstance => {
  // this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
  // do not define the store plugin data on the top level! Be sure to define it inside the scope of the plugin function!!
  const { store } = vuexStorePluginOptions

  const dataBackups: { [collectionPath: string]: Map<string, Record<string, any>[]> } = {}
  const makeBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // // set the backup map for the collection
    // if (!(collectionPath in dataBackups)) dataBackups[collectionPath] = new Map()
    // const backupCollectionMap = dataBackups[collectionPath]
    // // set the backup array for the doc
    // if (!backupCollectionMap.has(docId)) backupCollectionMap.set(docId, [])
    // // make a backup of whatever is found in the data
    // const docBackup = copy(data[collectionPath].get(docId))
    // const arr = backupCollectionMap.get(docId)
    // if (docBackup && arr) arr.push(docBackup)
  }

  const restoreBackup: MakeRestoreBackup = (collectionPath, docId) => {
    // // set the backup map for the collection
    // if (!(collectionPath in dataBackups)) return
    // const backupCollectionMap = dataBackups[collectionPath]
    // // set the backup array for the doc
    // if (!backupCollectionMap.has(docId)) return
    // const docBackupArray = backupCollectionMap.get(docId)
    // if (!docBackupArray || !docBackupArray.length) {
    //   // the backup was "undefined", so we need to delete it
    //   data[collectionPath].delete(docId)
    //   return
    // }
    // // restore the backup of whatever is found and replace with the data
    // const docBackup = docBackupArray.pop()
    // if (docBackup) data[collectionPath].set(docId, docBackup)
    // // the backup was "undefined", so we need to delete it
    // if (docBackup === undefined) data[collectionPath].delete(docId)
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  const modulesAlreadySetup = new Set()
  const setupModule = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginActionPayloadBase<VuexStorePluginModuleConfig>): void | 'exists' => {
    const isDocModule = isFullString(docId)
    const modulePath = [collectionPath, docId].filter(Boolean).join('/')
    if (modulesAlreadySetup.has(modulePath)) return
    const docModuleAlreadyExists = store.hasModule(modulePath.split('/')) && isDocModule
    if (docModuleAlreadyExists) {
      console.error(
        'Magnetar tried to register a module that already existed... modulePath: ' + modulePath
      )
      return 'exists'
    }

    const { state = {}, mutations = {}, actions = {}, getters = {} } = pluginModuleConfig

    const collectionModuleAlreadyExists = store.hasModule(collectionPath.split('/'))
    if (!collectionModuleAlreadyExists) {
      // collection module
      store.registerModule(modulePath.split('/'), {
        namespaced: true,
        state: () => merge({}, isDocModule ? {} : state),
        mutations: { ...(isDocModule ? {} : mutations) },
        actions: { ...(isDocModule ? {} : actions) },
        getters: { ...(isDocModule ? {} : getters) },
      })
    }
    modulesAlreadySetup.add(modulePath)
    if (!isDocModule) return

    // also register the doc module
    store.registerModule(modulePath.split('/'), {
      namespaced: true,
      state: () => merge({}, isDocModule ? state : {}),
      mutations: {
        ...(isDocModule ? mutations : {}),
        ...docMutations,
      },
      actions: { ...(isDocModule ? actions : {}) },
      getters: { ...(isDocModule ? getters : {}) },
    })
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  const getModuleData = ({
    collectionPath,
    docId,
    pluginModuleConfig = {},
  }: PluginActionPayloadBase<VuexStorePluginModuleConfig>): any => {
    const collectionState = getProp(store.state, collectionPath) as Record<string, any>
    if (!isAnyObject(collectionState)) {
      throw new Error(
        `Magnetar tried to access Vuex state that was non existent for collectionPath: ${collectionPath}`
      )
    }
    // if it's a doc, return the specific doc
    if (docId) return collectionState[docId]
    // if it's a collection, we must return the collectionState but with applied query clauses
    // but remember, the return type MUST be a map with id as keys and the docs as value
    const clauses: Clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit'])

    const result = filterDataPerClauses(collectionState, clauses)
    if (result === 'no-filter') {
      return objectToMap(collectionState)
    }
    const resultAsDic = Object.fromEntries(result)
    return objectToMap(resultAsDic, result)
  }

  // the plugin must try to implement logic for every `ActionName`
  const get = getActionFactory(store, vuexStorePluginOptions, setupModule)
  const stream = streamActionFactory(store, vuexStorePluginOptions, setupModule)
  const insert = insertActionFactory(store, vuexStorePluginOptions, setupModule, makeBackup)
  const _merge = writeActionFactory(store, vuexStorePluginOptions, setupModule, 'merge', makeBackup)
  const assign = writeActionFactory(
    store,
    vuexStorePluginOptions,
    setupModule,
    'assign',
    makeBackup
  )
  const replace = writeActionFactory(
    store,
    vuexStorePluginOptions,
    setupModule,
    'replace',
    makeBackup
  )
  const deleteProp = deletePropActionFactory(store, vuexStorePluginOptions, makeBackup)
  const _delete = deleteActionFactory(store, vuexStorePluginOptions, makeBackup)

  const revert = revertActionFactory(store, vuexStorePluginOptions, restoreBackup)

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
