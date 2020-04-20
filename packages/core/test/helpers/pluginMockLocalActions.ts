import { merge } from 'merge-anything'
import { isArray, isString } from 'is-what'
import {
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
  isCollectionModule,
  ActionName,
  PlainObject,
} from '../../src/index'
import { StorePluginModuleConfig, StorePluginOptions, MakeRestoreBackup } from './pluginMockLocal'
import { throwIfEmulatedError } from './throwFns'
import { generateRandomId } from './generateRandomId'

export function writeActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  actionName: 'merge' | 'assign' | 'replace',
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginWriteAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // write actions cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = data[collectionPath]
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
  data: { [collectionPath: string]: Map<string, PlainObject> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): string {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    if (isCollection) {
      const docId = String(payload.id) || generateRandomId()
      const collectionPath = modulePath
      if (makeBackup) makeBackup(collectionPath, docId)
      data[collectionPath].set(docId, payload)
      return docId
    }
    // else it's a doc
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    if (makeBackup) makeBackup(collectionPath, docId)
    const collectionMap = data[collectionPath]
    if (!collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)
    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return docId
  }
}

export function deletePropActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeletePropAction {
  return function (
    payload: string | string[],
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // `deleteProp` action cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = data[collectionPath]
    const docData = collectionMap.get(docId)

    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      delete docData[propToDelete]
    }
  }
}

export function deleteActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginDeleteAction {
  return function (
    payload: void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): void {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    // delete cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')

    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    data[collectionPath].delete(docId)
  }
}

export function getActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<GetResponse | DoOnGet> => {
    // this is custom logic to be implemented by the plugin author
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    makeBackup(collectionPath, docId)
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should be merged into the local stores
    const doOnGetAction: DoOnGet = (payload, meta): void => {
      insertActionFactory(data, storePluginOptions)(payload, modulePath, pluginModuleConfig)
    }
    return doOnGetAction
  }
}

export function streamActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  storePluginOptions: StorePluginOptions,
  makeBackup?: MakeRestoreBackup
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    // this mocks how the result from the next store (the remote store) should update this local store per action type
    // hover over the prop names below to see more info on when they are triggered:
    const doOnStream: DoOnStream = {
      added: (payload, meta) => {
        insertActionFactory(data, storePluginOptions)(payload, modulePath, pluginModuleConfig) // prettier-ignore
      },
      modified: (payload, meta) => {
        insertActionFactory(data, storePluginOptions)(payload, modulePath, pluginModuleConfig) // prettier-ignore
      },
      removed: (payload, meta) => {
        const isCollection = isCollectionModule(modulePath)
        const pathToDelete = !isCollection
          ? modulePath
          : isString(payload)
          ? `${modulePath}/${payload}`
          : `${modulePath}/${payload.id}`
        deleteActionFactory(data, storePluginOptions)(undefined, pathToDelete, pluginModuleConfig)
      },
    }
    return doOnStream
  }
}

export function revertActionFactory (
  data: { [collectionPath: string]: Map<string, PlainObject> },
  simpleStoreOptions: StorePluginOptions,
  restoreBackup: MakeRestoreBackup
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    actionName: ActionName
  ): void {
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    // revert all write actions when called on a doc
    if (
      docId &&
      ['insert', 'merge', 'assign', 'replace', 'delete', 'deleteProp'].includes(actionName)
    ) {
      restoreBackup(collectionPath, docId)
      return
    }
    // insert on collection (no id)
    if (!docId && actionName === 'insert') {
      throw new Error(`revert not yet implemented for insert on collections`)
    }
    // haven't implemented reverting 'get', 'stream' actions yet
    throw new Error(`revert not yet implemented for ${actionName}`)
  }
}
