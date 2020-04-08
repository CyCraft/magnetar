import pathToProp from 'path-to-prop'
import { isCollectionModule } from '../../src'
import { PlainObject } from '../../src/types/base'
import { ActionName, actionNameTypeMap } from '../../src/types/actions'
import { StorePluginModuleConfig } from './pluginMock'
import {
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  StreamResponse,
  DoOnRead,
  MustExecuteOnRead,
  PluginGetAction,
  MustExecuteOnGet,
  PluginRevertAction,
} from '../../src/types/plugins'
import { merge } from 'merge-anything'
import { isArray, isString } from 'is-what'
import { throwIfEmulatedError } from './throwFns'

export function writeActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storeName: string,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginWriteAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): string | void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storeName)
    // this is custom logic to be implemented by the plugin author
    const isCollection = isCollectionModule(modulePath)

    if (actionName === 'insert' && isCollection) {
      const id = `${Math.random()}${Math.random()}${Math.random()}`
      const collectionPath = modulePath
      const collectionMap = moduleData[collectionPath]
      collectionMap.set(id, payload)
      return id
    }
    // any write action other than `insert` cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const collectionPath = modulePath.split('/').slice(0, -1).join('/') // prettier-ignore
    const docId = modulePath.split('/').slice(-1)[0]
    const collectionMap = moduleData[collectionPath]
    const docData = collectionMap.get(docId)
    if (actionName === 'insert') {
      Object.entries(payload).forEach(([key, value]) => {
        docData[key] = value
      })
    }
    if (actionName === 'merge') {
      Object.entries(payload).forEach(([key, value]) => {
        docData[key] = merge(docData[key], value)
      })
    }
  }
}

export function deleteActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storeName: string,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginDeleteAction {
  return function (
    payload: void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    const payloadArray = isArray(payload) ? payload : [payload]
    // this mocks an error during execution
    throwIfEmulatedError(payload, storeName)
    // this is custom logic to be implemented by the plugin author
    const isCollection = isCollectionModule(modulePath)

    // delete cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const collectionPath = modulePath
      .split('/')
      .slice(0, -1)
      .join('/')
    const docId = modulePath.split('/').slice(-1)[0]
    const collectionMap = moduleData[collectionPath]
    collectionMap.delete(docId)
  }
}

export function getActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storeName: string,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    mustExecuteOnGet: MustExecuteOnGet
  ): Promise<void | PlainObject | PlainObject[]> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
    // this mocks an error during execution
    throwIfEmulatedError(payload, storeName)
    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should be merged into the local stores
    mustExecuteOnGet.registerDoOnAdded((payload, meta): void => {
      writeActionFactory(moduleData, 'insert', storeName)(payload, modulePath, pluginModuleConfig)
    })
    // in case of a local store that doesn't fetch from anywhere, not even from cach, we could return early here
    return
  }
}

export function streamActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storeName: string,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnRead | Promise<StreamResponse | DoOnRead> => {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storeName)
    // this is custom logic to be implemented by the plugin author
    // this mocks how the result from the next store (the remote store) should update this local store per action type
    // hover over the prop names below to see more info on when they are triggered:
    const doOnRead: DoOnRead = {
      added: (payload, meta) => {
        writeActionFactory(moduleData, 'insert', storeName)(payload, modulePath, pluginModuleConfig)
      },
      modified: (payload, meta) => {
        writeActionFactory(moduleData, 'insert', storeName)(payload, modulePath, pluginModuleConfig)
      },
      removed: (payload, meta) => {
        const isCollection = isCollectionModule(modulePath)
        const pathToDelete = !isCollection
          ? modulePath
          : isString(payload)
          ? `${modulePath}/${payload}`
          : `${modulePath}/${payload.id}`
        deleteActionFactory(moduleData, 'delete', storeName)(
          undefined,
          pathToDelete,
          pluginModuleConfig
        )
      },
    }
    return doOnRead
  }
}

export function revertActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storeName: string,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    actionName: ActionName
  ): void {
    // this is custom logic to be implemented by the plugin author
    if (!payload) return
    // strings are only possible during deletions
    // haven't implemented reverting deletions yet
    if (isString(payload) || (isArray(payload) && isString(payload[0]))) return
    const actionType = actionNameTypeMap[actionName]
    // this mocks data reverted during a write
    if (actionType === 'write') {
      const db = pathToProp(moduleData, modulePath)
      const docs = isArray(payload) ? payload : [payload]
      docs.forEach(doc => {
        db[doc.id] = undefined
      })
    }
    // this mocks data reverted during a read
    if (actionType === 'read') {
      restoreDataSnapshot()
    }
  }
}
