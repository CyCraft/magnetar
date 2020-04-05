import { merge } from 'merge-anything'
import { copy } from 'copy-anything'
import { nestifyObject as nestify } from 'nestify-anything'
import {
  writeActionFactory as writeActionFactoryLocal,
  deleteActionFactory as deleteActionFactoryLocal,
  getActionFactory as getActionFactoryLocal,
  streamActionFactory as streamActionFactoryLocal,
} from './pluginMockActionsLocal'
import {
  writeActionFactory as writeActionFactoryRemote,
  deleteActionFactory as deleteActionFactoryRemote,
  getActionFactory as getActionFactoryRemote,
  streamActionFactory as streamActionFactoryRemote,
} from './pluginMockActionsRemote'
import {
  ActionName,
  VueSyncError,
  actionNameTypeMap,
  ActionNameWrite,
} from '../../src/types/actions'
import {
  PluginInstance,
  PluginRevertAction,
  PluginGetAction,
  PluginWriteAction,
  PluginStreamAction,
  PluginDeleteAction,
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'
import { Modified } from '../../src/types/base'
import pathToProp from 'path-to-prop'

// there are two interfaces to be defined & exported by each plugin
// - VueSyncPluginConfig
// - VueSyncPluginModuleConfig

function isUndefined (payload: any): payload is undefined | void {
  return payload === undefined
}

export interface VueSyncPluginConfig {
  storeName: string
}
export interface VueSyncPluginModuleConfig {
  path: string
  initialData?: PlainObject
}

function dots (path: string): string { return path.replace(/\//g, '.') } // prettier-ignore
function isOdd (number: number) { return number % 2 === 1 } // prettier-ignore
function isEven (number: number) { return number % 2 === 0 } // prettier-ignore
export function isModuleCollection (moduleConfig: VueSyncPluginModuleConfig): boolean {
  return isOdd(moduleConfig.path.split('/').length)
}

function createGetAction (
  moduleData: PlainObject,
  storeName: string,
  makeDataSnapshot: any
): PluginGetAction {
  // PluginGetAction for the 'local' store:
  if (storeName === 'local') return getActionFactoryLocal(moduleData, storeName, makeDataSnapshot)
  // PluginGetAction for the 'remote' store:
  return getActionFactoryRemote(moduleData, storeName, makeDataSnapshot)
}

function createStreamAction (moduleData: PlainObject, storeName: string): PluginStreamAction {
  // PluginStreamAction for the 'local' store:
  if (storeName === 'local') return streamActionFactoryLocal(moduleData, storeName)
  // PluginStreamAction for the 'remote' store:
  return streamActionFactoryRemote(moduleData, storeName)
}

function createWriteAction (
  moduleData: PlainObject,
  actionName: ActionNameWrite,
  storeName: string
): PluginWriteAction {
  // PluginWriteAction for the 'local' store:
  if (storeName === 'local') return writeActionFactoryLocal(moduleData, actionName, storeName)
  // PluginWriteAction for the 'remote' store:
  return writeActionFactoryRemote(moduleData, actionName, storeName)
}

function createDeleteAction (moduleData: PlainObject, storeName: string): PluginDeleteAction {
  // PluginDeleteAction for the 'local' store:
  if (storeName === 'local') return deleteActionFactoryLocal(moduleData, storeName)
  // PluginDeleteAction for the 'remote' store:
  return deleteActionFactoryRemote(moduleData, storeName)
}

function createRevertAction (
  moduleData: PlainObject,
  storeName: string,
  restoreDataSnapshot: any
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    actionName: ActionName,
    payload: PlainObject | void,
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<void> {
    // this is custom logic to be implemented by the plugin author
    return new Promise((resolve, reject) => {
      if (isUndefined(payload)) return resolve(payload)
      setTimeout(() => {
        // this mocks an error during execution
        if (payload.shouldFailOnRevert === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'revert failed',
          }
          reject(errorToThrow)
        } else {
          const actionType = actionNameTypeMap[actionName]
          // this mocks data reverted during a write
          if (actionType === 'write') {
            const { path } = pluginModuleConfig
            const db = pathToProp(moduleData, path)
            db[payload.id] = undefined
          }
          // this mocks data reverted during a read
          if (actionType === 'read') {
            restoreDataSnapshot()
          }
          resolve()
        }
      }, 1)
    })
  }
}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
export const VueSyncGenericPlugin = (config: VueSyncPluginConfig): PluginInstance => {
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
  function setModuleDataReference<T extends PlainObject> (
    moduleConfig: VueSyncPluginModuleConfig
  ): Modified<T> {
    const { path, initialData } = moduleConfig
    const initialModuleData = nestify({ [dots(path)]: initialData || {} })
    Object.entries(initialModuleData).forEach(([key, value]) => {
      data[key] = merge(data[key], value)
    })
    return pathToProp(data, path)
  }

  // the plugin must try to implement logic for every `ActionName`
  const get: PluginGetAction = createGetAction(data, storeName, makeDataSnapshot)
  const stream: PluginStreamAction = createStreamAction(data, storeName)
  const insert: PluginWriteAction = createWriteAction(data, 'insert', storeName)
  const _merge: PluginWriteAction = createWriteAction(data, 'merge', storeName)
  // const assign: PluginWriteAction = createWriteAction(data, 'assign', storeName)
  // const replace: PluginWriteAction = createWriteAction(data, 'replace', storeName)
  const _delete: PluginDeleteAction = createDeleteAction(data, storeName)
  const revert: PluginRevertAction = createRevertAction(data, storeName, restoreDataSnapshot)

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
