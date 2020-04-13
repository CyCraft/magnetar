/* eslint-disable @typescript-eslint/no-unused-vars */
import { merge } from 'merge-anything'
import { isArray, isString } from 'is-what'
import {
  isCollectionModule,
  PlainObject,
  ActionName,
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  MustExecuteOnRead,
  PluginGetAction,
  PluginRevertAction,
  PluginDeletePropAction,
  PluginInsertAction,
  GetResponse,
  DoOnGet,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '.'
import { generateRandomId } from './generateRandomId'

export function writeActionFactory (
  moduleData: PlainObject,
  actionName: 'merge' | 'assign' | 'replace',
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginWriteAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // write actions cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    if (!collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)
    if (actionName === 'merge') {
      Object.entries(payload).forEach(([key, value]) => {
        docDataToMutate[key] = merge(docDataToMutate[key], value)
      })
    }
  }
}

export function insertActionFactory (
  moduleData: PlainObject,
  actionName: 'insert',
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginInsertAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): string {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    if (isCollection) {
      const id = payload.id || generateRandomId()
      const collectionPath = modulePath
      moduleData[collectionPath].set(id, payload)
      return id
    }
    // else it's a doc
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    if (!collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)
    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return docId
  }
}

export function deletePropActionFactory (
  moduleData: PlainObject,
  actionName: 'deleteProp',
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginDeletePropAction {
  return function (
    payload: string | string[],
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // `deleteProp` action cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    const docData = collectionMap.get(docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      delete docData[propToDelete]
    }
  }
}

export function deleteActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginDeleteAction {
  return function (
    payload: void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // delete cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    moduleData[collectionPath].delete(docId)
  }
}

export function getActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<GetResponse | DoOnGet> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should be merged into the local stores
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(moduleData, 'insert', simpleStoreConfig)(
        payload,
        modulePath,
        pluginModuleConfig
      )
      // return writeActionFactoryThatReturnsPayload(moduleData, 'insert', simpleStoreConfig)(
      //   payload,
      //   modulePath,
      //   pluginModuleConfig
      // )
    }
    // in case of a local store that doesn't fetch from anywhere, not even from cach, we could return early here
    return doOnGetAction
  }
}

export function streamActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    // this is custom logic to be implemented by the plugin author
    // this mocks how the result from the next store (the remote store) should update this local store per action type
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        insertActionFactory(moduleData, 'insert', simpleStoreConfig)(payload, modulePath, pluginModuleConfig) // prettier-ignore
      },
      modified: (payload, meta) => {
        insertActionFactory(moduleData, 'insert', simpleStoreConfig)(payload, modulePath, pluginModuleConfig) // prettier-ignore
      },
      removed: (payload, meta) => {
        const isCollection = isCollectionModule(modulePath)
        const pathToDelete = !isCollection
          ? modulePath
          : isString(payload)
          ? `${modulePath}/${payload}`
          : `${modulePath}/${payload.id}`
        deleteActionFactory(moduleData, 'delete', simpleStoreConfig)(
          undefined,
          pathToDelete,
          pluginModuleConfig
        )
      },
    }
    return doOnStream
  }
}

export function revertActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  simpleStoreConfig: SimpleStoreConfig,
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
    // this mocks data reverted during a read
    if (actionName === 'get' || actionName === 'stream') {
      restoreDataSnapshot()
      return
    }
    // this mocks data reverted during a write
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    if (!docId) {
      // collection
      throw new Error(
        `revert not yet implemented for insert on collection - payload: ${JSON.stringify(payload)}`
      )
    }
    if (actionName === 'insert') {
      collectionMap.delete(docId)
      return
    }
    throw new Error('revert not yet implemented for this action')
  }
}
