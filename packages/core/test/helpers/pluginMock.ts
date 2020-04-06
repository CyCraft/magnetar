import { merge } from 'merge-anything'
import { copy } from 'copy-anything'
import { nestifyObject as nestify } from 'nestify-anything'
import {
  writeActionFactory as writeActionFactoryLocal,
  deleteActionFactory as deleteActionFactoryLocal,
  getActionFactory as getActionFactoryLocal,
  streamActionFactory as streamActionFactoryLocal,
  revertActionFactory as revertActionFactoryLocal,
} from './pluginMockActionsLocal'
import {
  writeActionFactory as writeActionFactoryRemote,
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
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'
import pathToProp from 'path-to-prop'

// there are two interfaces to be defined & exported by each plugin
// - StorePluginConfig
// - StorePluginModuleConfig

export interface StorePluginConfig {
  storeName: string
}
export interface StorePluginModuleConfig {
  path: string
  initialData?: PlainObject
}

function dots (path: string): string { return path.replace(/\//g, '.') } // prettier-ignore
function isOdd (number: number) { return number % 2 === 1 } // prettier-ignore
export function isModuleCollection (moduleConfig: StorePluginModuleConfig): boolean {
  return isOdd(moduleConfig.path.split('/').length)
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
      delete: deleteActionFactoryLocal,
      get: getActionFactoryLocal,
      stream: streamActionFactoryLocal,
      revert: revertActionFactoryLocal,
    },
    remote: {
      insert: writeActionFactoryRemote,
      merge: writeActionFactoryRemote,
      delete: deleteActionFactoryRemote,
      get: getActionFactoryRemote,
      stream: streamActionFactoryRemote,
      revert: revertActionFactoryRemote,
    },
  }
  const f = storeNameActionNameFnMap[storeName][actionName]
  return f(moduleData, actionName, storeName, makeDataSnapshot, restoreDataSnapshot)
}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
export const VueSyncGenericPlugin = (config: StorePluginConfig): PluginInstance => {
  const { storeName } = config

  // this is the local state of the plugin, each plugin should have something similar
  const data: PlainObject = {}

  // this mocks some sort of data snapshot restore functionality of the plugin
  const dataSnapshots = []
  const makeDataSnapshot = () => dataSnapshots.push(copy(data))
  const restoreDataSnapshot = () => {
    const last = dataSnapshots.pop()
    Object.keys(data.pokedex).forEach(key => delete data.pokedex[key])
    Object.keys(last.pokedex).forEach(key => (data.pokedex[key] = last.pokedex[key]))
  }

  // this is triggered on every module that is registered, every module should have something similar
  // prettier-ignore
  function setModuleDataReference (moduleConfig: StorePluginModuleConfig) {
    const { path, initialData } = moduleConfig
    const initialModuleData = nestify({ [dots(path)]: initialData || {} })
    Object.entries(initialModuleData).forEach(([key, value]) => {
      data[key] = merge(data[key], value)
    })
    return pathToProp(data, path)
  }

  // the plugin must try to implement logic for every `ActionName`
  const get: PluginGetAction = actionFactory(data, 'get', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const stream: PluginStreamAction = actionFactory(data, 'stream', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const insert: PluginWriteAction = actionFactory(data, 'insert', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const _merge: PluginWriteAction = actionFactory(data, 'merge', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const _delete: PluginDeleteAction = actionFactory(data, 'delete', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  const revert: PluginRevertAction = actionFactory(data, 'revert', storeName, makeDataSnapshot, restoreDataSnapshot) // prettier-ignore
  // const assign: PluginWriteAction = actionFactory(data, 'assign', storeName, makeDataSnapshot, restoreDataSnapshot)
  // const replace: PluginWriteAction = actionFactory(data, 'replace', storeName, makeDataSnapshot, restoreDataSnapshot)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    config,
    revert,
    setModuleDataReference,
    actions: {
      get,
      stream,
      insert,
      merge: _merge,
      // assign,
      // replace,
      delete: _delete,
    },
  }
  return instance
}
