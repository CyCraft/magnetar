import { copy } from 'copy-anything'
import {
  writeActionFactory as writeActionFactoryLocal,
  deletePropActionFactory as deletePropActionFactoryLocal,
  deleteActionFactory as deleteActionFactoryLocal,
  getActionFactory as getActionFactoryLocal,
  streamActionFactory as streamActionFactoryLocal,
  revertActionFactory as revertActionFactoryLocal,
} from './pluginMockActionsLocal'
import {
  writeActionFactory as writeActionFactoryRemote,
  deletePropActionFactory as deletePropActionFactoryRemote,
  deleteActionFactory as deleteActionFactoryRemote,
  getActionFactory as getActionFactoryRemote,
  streamActionFactory as streamActionFactoryRemote,
  revertActionFactory as revertActionFactoryRemote,
} from './pluginMockActionsRemote'
import { ActionName } from '../../src/types/actions'
import {
  PluginInstance,
  PluginRevertAction,
  PluginGetAction,
  PluginWriteAction,
  PluginStreamAction,
  PluginDeleteAction,
  VueSyncPlugin,
  PluginDeletePropAction,
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'

// there are two interfaces to be defined & exported by each plugin
// - StorePluginConfig
// - StorePluginModuleConfig

export interface StorePluginConfig {
  storeName: string
}
export interface StorePluginModuleConfig {
  path?: string
  initialData?: PlainObject | [string, PlainObject][]
}

function actionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storeName: string,
  makeDataSnapshot: any,
  restoreDataSnapshot: any
): any {
  const storeNameActionNameFnMap = {
    local: {
      insert: writeActionFactoryLocal,
      merge: writeActionFactoryLocal,
      deleteProp: deletePropActionFactoryLocal,
      delete: deleteActionFactoryLocal,
      get: getActionFactoryLocal,
      stream: streamActionFactoryLocal,
      revert: revertActionFactoryLocal,
    },
    remote: {
      insert: writeActionFactoryRemote,
      merge: writeActionFactoryRemote,
      deleteProp: deletePropActionFactoryRemote,
      delete: deleteActionFactoryRemote,
      get: getActionFactoryRemote,
      stream: streamActionFactoryRemote,
      revert: revertActionFactoryRemote,
    },
  }
  const f = storeNameActionNameFnMap[storeName][actionName]
  return f(moduleData, actionName, storeName, makeDataSnapshot, restoreDataSnapshot)
}

// this is the local state of the plugin, each plugin that acts as a "local Store Plugin" should have something similar
const data: PlainObject = {}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
export const VueSyncGenericPlugin: VueSyncPlugin = (config: StorePluginConfig): PluginInstance => {
  const { storeName } = config

  // this mocks some sort of data snapshot restore functionality of the plugin
  const dataSnapshots = []
  const makeDataSnapshot = () => dataSnapshots.push(copy(data))
  const restoreDataSnapshot = () => {
    const last = dataSnapshots.pop()
    Object.keys(data.pokedex).forEach(key => delete data.pokedex[key])
    Object.keys(last.pokedex).forEach(key => (data.pokedex[key] = last.pokedex[key]))
  }

  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered upon instantiating a collection.
   */
  const returnCollectionData = (modulePath: string, moduleConfig: StorePluginModuleConfig = {}) => {
    const { initialData } = moduleConfig
    const collectionDB = data[modulePath] || new Map()
    if (initialData && !data[modulePath]) {
      for (const [docId, docData] of initialData) {
        collectionDB.set(docId, docData)
      }
    }
    data[modulePath] = collectionDB
    return data[modulePath]
  }
  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered upon instantiating a doc.
   */
  const returnDocData = (modulePath: string, moduleConfig: StorePluginModuleConfig = {}) => {
    const collectionPath = modulePath
      .split('/')
      .slice(0, -1)
      .join('/')
    const docId = modulePath.split('/').slice(-1)[0]
    const collectionDB = returnCollectionData(collectionPath)
    if (collectionDB.get(docId) === undefined) {
      const { initialData = {} } = moduleConfig
      collectionDB.set(docId, initialData)
    }
    return collectionDB.get(docId)
  }

  // the plugin must try to implement logic for every `ActionName`
  const get: PluginGetAction = actionFactory(data, 'get', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const stream: PluginStreamAction = actionFactory(data, 'stream', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const insert: PluginWriteAction = actionFactory(data, 'insert', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const _merge: PluginWriteAction = actionFactory(data, 'merge', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const deleteProp: PluginDeletePropAction = actionFactory(data, 'deleteProp', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const _delete: PluginDeleteAction = actionFactory(data, 'delete', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const revert: PluginRevertAction = actionFactory(data, 'revert', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  // const assign: PluginWriteAction = actionFactory(data, 'assign', storeName, makeDataSnapshot, restoreDataSnapshot)
  // const replace: PluginWriteAction = actionFactory(data, 'replace', storeName, makeDataSnapshot, restoreDataSnapshot)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    revert,
    actions: {
      get,
      stream,
      insert,
      merge: _merge,
      deleteProp,
      // assign,
      // replace,
      delete: _delete,
    },
    returnDocData,
    returnCollectionData,
  }
  return instance
}
