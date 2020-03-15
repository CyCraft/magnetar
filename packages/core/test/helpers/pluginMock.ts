import { merge } from 'merge-anything'
import { copy } from 'copy-anything'
import { nestifyObject as nestify } from 'nestify-anything'
import { ActionName, VueSyncError } from '../../src/types/actions'
import {
  PluginInstance,
  PluginRevertAction,
  PluginGetAction,
  PluginWriteAction,
  PluginStreamAction,
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'
import { OnRetrieveHandler, Modified } from '../../src/types/base'
import pathToProp from 'path-to-prop'

// there are two interfaces to be defined & exported by each plugin
// - VueSyncPluginConfig
// - VueSyncPluginModuleConfig

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

function createGetAction (moduleData: PlainObject, storeName: string): PluginGetAction {
  // this is a `PluginAction`:
  return async (
    onRetrieveHandlers: OnRetrieveHandler[],
    payload: PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<PlainObject[] | PlainObject> => {
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          resolve(pathToProp(moduleData, path))
        }
      }, 10)
    })
  }
}

function createWriteAction (
  moduleData: PlainObject,
  actionName: string,
  storeName: string
): PluginWriteAction {
  // this is a `PluginAction`:
  return async <T extends PlainObject>(
    payload: T,
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<Modified<T>> => {
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    const moduleIsDocument = isEven(path.split('/').length)
    const shouldFail =
      payload.shouldFail === storeName || (actionName === 'insert' && moduleIsDocument)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          const db = pathToProp(moduleData, path)
          if (actionName === 'insert') {
            db[payload.id] = payload
          }
          if (actionName === 'merge') {
            db[payload.id] = merge(db[payload.id], payload)
          }
          resolve(payload)
        }
      }, 10)
    })
  }
}

function createRevertAction (moduleData: PlainObject, storeName: string): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function<T extends PlainObject> (
    actionName: ActionName,
    payload: T,
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<T> {
    // this is custom logic to be implemented by the plugin author
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFailOnRevert === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'revert failed',
          }
          reject(errorToThrow)
        } else {
          resolve({ ...payload, reverted: { actionName, storeName } })
        }
      }, 10)
    })
  }
}

// a Vue Sync plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
// each action must have the proper for both collection and doc type modules
export const VueSyncGenericPlugin = (config: VueSyncPluginConfig): PluginInstance => {
  const { storeName } = config

  const data: PlainObject = {}

  // triggered on every module that is registered
  function setModuleDataReference<T extends PlainObject> (
    moduleConfig: VueSyncPluginModuleConfig,
    previousStoreData: T
  ): Modified<T> {
    const { path, initialData } = moduleConfig
    const initialModuleData = nestify({ [dots(path)]: initialData || {} })
    Object.entries(initialModuleData).forEach(([key, value]) => {
      data[key] = merge(data[key], value)
    })
    return pathToProp(data, path)
  }

  // the plugin must try to implement logic for every `ActionName`
  const get: PluginGetAction = createGetAction(data, storeName)
  // const stream: PluginStreamAction = createGetAction(data, storeName)
  const insert: PluginWriteAction = createWriteAction(data, 'insert', storeName)
  const _merge: PluginWriteAction = createWriteAction(data, 'merge', storeName)
  const assign: PluginWriteAction = createWriteAction(data, 'assign', storeName)
  const replace: PluginWriteAction = createWriteAction(data, 'replace', storeName)
  const _delete: PluginWriteAction = createWriteAction(data, 'delete', storeName)
  const revert: PluginRevertAction = createRevertAction(data, storeName)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    config,
    revert,
    setModuleDataReference,
    actions: {
      get,
      // stream,
      insert,
      merge: _merge,
      assign,
      replace,
      delete: _delete,
    },
  }
  return instance
}
