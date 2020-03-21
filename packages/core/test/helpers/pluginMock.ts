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
  OnNextStoresStream,
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'
import { Modified } from '../../src/types/base'
import pathToProp from 'path-to-prop'
import { bulbasaur, charmander, flareon } from './pokemon'
import { EventFnSuccess } from '../../src/types/events'
import { isArray, isPlainObject } from 'is-what'

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
function isModuleCollection (moduleConfig: VueSyncPluginModuleConfig): boolean {
  return isOdd(moduleConfig.path.split('/').length)
}

function createStreamAction (moduleData: PlainObject, storeName: string): PluginStreamAction {
  // this is a `PluginAction`:
  return (
    payload: void | PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig,
    onNextStoresStream: OnNextStoresStream
  ):
    | void
    | { streaming: Promise<void>; stop: () => void }
    | Promise<void | { streaming: Promise<void>; stop: () => void }> => {
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    const db = pathToProp(moduleData, path)

    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should update this local store per action type
    if (storeName === 'local') {
      const isCollection = isModuleCollection(pluginModuleConfig)
      const inserted = (payload: PlainObject) => {
        if (isCollection) {
          // this mocks data inserted into 'pokedex'
          db[payload.id] = payload
        } else {
          // this mocks data inserted into 'data/trainer' (each prop is replaced with whatever came from the server)
          Object.entries(payload).forEach(([key, value]) => {
            db[key] = value
          })
        }
      }
      const merged = (payload: PlainObject) => {
        if (isCollection) {
          // this mocks data merged into 'pokedex'
          db[payload.id] = merge(db[payload.id], payload)
        } else {
          // this mocks data merged into 'data/trainer'
          Object.entries(payload).forEach(([key, value]) => {
            db[key] = merge(db[key], value)
          })
        }
      }
      onNextStoresStream.inserted.push(inserted)
      onNextStoresStream.merged.push(merged)
      // in this case, the local store doesn't have a real-time connection, so we return early
      return
    }

    // otherwise if we are trying to mock the remote store plugin we'll mock opening a stream
    let dataRetrieved = []
    // this mocks data returned from 'pokedex'
    if (path === 'pokedex') {
      // this is to mock different data in the local store opposed to the remote one
      dataRetrieved = storeName === 'local' ? [bulbasaur, charmander] : [bulbasaur, flareon]
    } else if (path === 'data/trainer') {
      // this mocks data returned from 'data/trainer'
      dataRetrieved =
        // this is to mock different data in the local store opposed to the remote one
        storeName === 'local'
          ? [{ name: 'Luca', age: 10, colour: 'blue' }]
          : [{ name: 'Luca', age: 10, dream: 'job' }]
      Object.entries(dataRetrieved).forEach(([key, value]) => {
        db[key] = value
      })
    }
    // this mocks actually data coming in at different intervals
    dataRetrieved.forEach((data, i) => {
      const waitTime = 50 + i * 10
      setTimeout(() => {
        for (const inserted of onNextStoresStream.inserted) {
          inserted(data)
        }
      }, waitTime)
    })
    // this mocks the opening of the stream
    let stopStreaming
    const streaming: Promise<void> = new Promise((resolve, reject): void => {
      stopStreaming = resolve
      setTimeout(() => {
        // this mocks an error during execution
        if (payload && payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        }
      }, 1)
    })
    function stop (): void {
      stopStreaming()
    }
    return { streaming, stop }
  }
}

function createGetAction (
  moduleData: PlainObject,
  storeName: string,
  makeDataSnapshot: any
): PluginGetAction {
  // this is a `PluginAction`:
  return async (
    payload: void | PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig,
    onNextStoresSuccess: EventFnSuccess[]
  ): Promise<void | PlainObject | PlainObject[]> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
    const { path } = pluginModuleConfig

    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should be merged into the local stores
    if (storeName === 'local') {
      const isCollection = isModuleCollection(pluginModuleConfig)
      const { path } = pluginModuleConfig
      const db = pathToProp(moduleData, path)
      onNextStoresSuccess.push(({ result }) => {
        if (isUndefined(result)) return
        Object.keys(db).forEach(key => delete db[key])
        if (isCollection) {
          // this mocks data to be replaced in 'pokedex'
          if (isArray(result)) result.forEach(doc => (db[doc.id] = doc))
        } else {
          // this mocks data to be replaced in 'data/trainer'
          if (isPlainObject(result)) {
            Object.entries(result).forEach(([key, value]) => {
              db[key] = value
            })
          }
        }
      })
    }
    // in case of a local store that doesn't fetch from anywhere, not even from cach, we could return early here

    // otherwise fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        if (payload && payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          const db = pathToProp(moduleData, path)
          let dataRetrieved: PlainObject | PlainObject[]
          // this mocks data returned from 'pokedex'
          if (path === 'pokedex') {
            // this is to mock different data in the local store opposed to the remote one
            dataRetrieved = storeName === 'local' ? [bulbasaur, charmander] : [bulbasaur, flareon]
            dataRetrieved.forEach(p => {
              db[p.id] = p
            })
          } else if (path === 'data/trainer') {
            // this mocks data returned from 'data/trainer'
            dataRetrieved =
              // this is to mock different data in the local store opposed to the remote one
              storeName === 'local'
                ? { name: 'Luca', age: 10, colour: 'blue' }
                : { name: 'Luca', age: 10, dream: 'job' }
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
  return async function<Payload extends PlainObject | void> (
    payload: Payload,
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<Modified<Payload>> {
    if (!isPlainObject(payload)) return
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    const isCollection = isModuleCollection(pluginModuleConfig)
    const shouldFail =
      payload.shouldFail === storeName || (actionName === 'insert' && !isCollection)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        if (shouldFail) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          const db = pathToProp(moduleData, path)
          // this mocks data inserted into 'pokedex'
          if (actionName === 'insert') {
            db[payload.id] = payload
          }
          if (actionName === 'merge') {
            // this mocks data merged into 'pokedex'
            if (isCollection) {
              db[payload.id] = merge(db[payload.id], payload)
            } else {
              // this mocks data merged into 'data/trainer'
              Object.entries(payload).forEach(([key, value]) => {
                db[key] = merge(db[key], value)
              })
            }
          }
          resolve(payload as Modified<Payload>)
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
  return function revert (
    actionName: ActionName,
    payload: PlainObject | void,
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): Promise<PlainObject | void> {
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
  const _delete: PluginWriteAction = createWriteAction(data, 'delete', storeName)
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
