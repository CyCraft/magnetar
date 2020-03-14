import { ActionName, VueSyncError } from '../../src/types/actions'
import {
  PluginInstance,
  PluginRevertAction,
  PluginActionConfig,
  PluginGetAction,
  PluginWriteAction,
  PluginStreamAction,
} from '../../src/types/plugins'
import { PlainObject } from '../../types/types/base'
import { OnRetrieveHandler } from '../../src/types/base'

// there are two interfaces to be defined & exported by each plugin
// - VueSyncPluginConfig
// - VueSyncPluginModuleConfig

export interface VueSyncPluginConfig {
  storeName: string
  initialState: PlainObject
}
export interface VueSyncPluginModuleConfig {
  path: string
}

function createGenericGetAction (storeName: string): PluginGetAction {
  // this is a `PluginAction`:
  return async (
    onRetrieveHandlers: OnRetrieveHandler[],
    payload: PlainObject = {},
    pluginActionConfig: PluginActionConfig
  ): Promise<PlainObject[] | PlainObject> => {
    // this is custom logic to be implemented by the plugin author
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          resolve({ name: 'Luca' })
        }
      }, 10)
    })
  }
}

function createGenericAction (storeName: string): PluginWriteAction {
  // this is a `PluginAction`:
  return async <T extends PlainObject>(
    payload: T,
    pluginActionConfig: PluginActionConfig
  ): Promise<Partial<T>> => {
    // this is custom logic to be implemented by the plugin author
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFail === storeName) {
          const errorToThrow: VueSyncError = {
            payload,
            message: 'fail',
          }
          reject(errorToThrow)
        } else {
          resolve(payload)
        }
      }, 10)
    })
  }
}

function createRevertAction (storeName: string): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function<T extends PlainObject> (
    actionName: ActionName,
    payload: T,
    pluginActionConfig: PluginActionConfig
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
  const { storeName, initialState } = config
  // the plugin must try to implement logic for every `ActionName`
  const get: PluginGetAction = createGenericGetAction(storeName, initialState)
  // const stream: PluginStreamAction = createGenericGetAction(storeName)
  const insert: PluginWriteAction = createGenericAction(storeName)
  const merge: PluginWriteAction = createGenericAction(storeName)
  const assign: PluginWriteAction = createGenericAction(storeName)
  const replace: PluginWriteAction = createGenericAction(storeName)
  const _delete: PluginWriteAction = createGenericAction(storeName)
  const revert: PluginRevertAction = createRevertAction(storeName)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    config,
    revert,
    actions: {
      get,
      // stream,
      insert,
      merge,
      assign,
      replace,
      delete: _delete,
    },
  }
  return instance
}
