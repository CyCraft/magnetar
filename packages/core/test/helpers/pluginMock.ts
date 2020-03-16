import { merge } from 'merge-anything'
import { copy } from 'copy-anything'
import { nestifyObject as nestify } from 'nestify-anything'
import { ActionName, VueSyncError, actionNameTypeMap } from '../../src/types/actions'
import {
  PluginInstance,
  PluginRevertAction,
  PluginGetAction,
  PluginWriteAction,
  PluginStreamAction,
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'
import { Modified } from '../../src/types/base'
import pathToProp from 'path-to-prop'
import { bulbasaur, charmander } from './pokemon'

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
function isModuleCollection (moduleConfig: VueSyncPluginModuleConfig): boolean {
  return isOdd(moduleConfig.path.split('/').length)
}

function createGetAction (
  moduleData: PlainObject,
  storeName: string,
  makeDataSnapshot: any
): PluginGetAction {
  // this is a `PluginAction`:
  return async (
    payload: PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<PlainObject[] | PlainObject> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
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
          const db = pathToProp(moduleData, path)
          let dataRetrieved
          if (path === 'pokedex') {
            dataRetrieved = [bulbasaur, charmander]
            dataRetrieved.forEach(p => {
              db[p.id] = p
            })
          } else {
            dataRetrieved = { name: 'Luca', age: 10, colour: 'blue' }
            Object.entries(dataRetrieved).forEach(([key, value]) => {
              db[key] = value
            })
          }
          resolve(dataRetrieved)
        }
      }, 1)
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
    const isCollection = isModuleCollection(pluginModuleConfig)
    const shouldFail =
      payload.shouldFail === storeName || (actionName === 'insert' && !isCollection)
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
            if (isCollection) {
              db[payload.id] = merge(db[payload.id], payload)
            } else {
              Object.entries(payload).forEach(([key, value]) => {
                db[key] = merge(db[key], value)
              })
            }
          }
          resolve(payload)
        }
      }, 1)
    })
  }
}

function createRevertAction (
  moduleData: PlainObject,
  storeName: string,
  restoreDataSnapshot: any
): PluginRevertAction {
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
          const actionType = actionNameTypeMap[actionName]
          if (actionType === 'write') {
            const { path } = pluginModuleConfig
            const db = pathToProp(moduleData, path)
            db[payload.id] = undefined
          }
          if (actionType === 'read') {
            restoreDataSnapshot()
          }
          resolve({ ...payload, reverted: { actionName, storeName } })
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

  const data: PlainObject = {}

  const dataSnapshots = []
  const makeDataSnapshot = () => dataSnapshots.push(copy(data))
  const restoreDataSnapshot = () => {
    const last = dataSnapshots.pop()
    Object.keys(data.pokedex).forEach(key => delete data.pokedex[key])
    Object.keys(last.pokedex).forEach(key => (data.pokedex[key] = last.pokedex[key]))
  }

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
  const get: PluginGetAction = createGetAction(data, storeName, makeDataSnapshot)
  // const stream: PluginStreamAction = createGetAction(data, storeName)
  const insert: PluginWriteAction = createWriteAction(data, 'insert', storeName)
  const _merge: PluginWriteAction = createWriteAction(data, 'merge', storeName)
  // const assign: PluginWriteAction = createWriteAction(data, 'assign', storeName)
  // const replace: PluginWriteAction = createWriteAction(data, 'replace', storeName)
  const _delete: PluginWriteAction = createWriteAction(data, 'delete', storeName)
  const revert: PluginRevertAction = createRevertAction(data, storeName, restoreDataSnapshot)

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
      // assign,
      // replace,
      delete: _delete,
    },
  }
  return instance
}
