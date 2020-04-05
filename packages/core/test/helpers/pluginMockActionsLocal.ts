import pathToProp from 'path-to-prop'
import { PlainObject } from '../../src/types/base'
import { ActionNameWrite, VueSyncError } from '../../src/types/actions'
import { VueSyncPluginModuleConfig, isModuleCollection } from './pluginMock'
import {
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  StreamResponse,
  DoOnRead,
  MustExecuteOnRead,
  PluginGetAction,
  MustExecuteOnGet,
} from '../../src/types/plugins'
import { merge } from 'merge-anything'
import { isArray, isString } from 'is-what'

export function writeActionFactory (
  moduleData: PlainObject,
  actionName: ActionNameWrite,
  storeName: string
): PluginWriteAction {
  return function (
    payload: PlainObject | PlainObject[],
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): PlainObject | PlainObject[] {
    // this mocks an error during execution
    const shouldFailProp = isArray(payload) ? payload[0].shouldFail : payload.shouldFail
    const shouldFail = shouldFailProp === storeName
    if (shouldFail) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    const isCollection = isModuleCollection(pluginModuleConfig)
    const isDocument = !isCollection
    const db = pathToProp(moduleData, path)

    const docs = isArray(payload) ? payload : [payload]
    const result: PlainObject[] = []
    for (const doc of docs) {
      if (actionName === 'insert') {
        if (isCollection) {
          const id = doc.id ?? String(Math.random())
          db[id] = doc
          result.push(doc)
          db[id] = doc
        }
        if (isDocument) {
          Object.entries(doc).forEach(([key, value]) => {
            db[key] = merge(db[key], value)
          })
          result.push(db)
        }
      }

      if (actionName === 'merge') {
        if (isCollection) {
          db[doc.id] = merge(db[doc.id], doc)
          result.push(db[doc.id])
        }
        if (isDocument) {
          Object.entries(doc).forEach(([key, value]) => {
            db[key] = merge(db[key], value)
          })
          result.push(db)
        }
      }
    }
    return isArray(payload) ? result : result[0]
  }
}

export function deleteActionFactory (
  moduleData: PlainObject,
  storeName: string
): PluginDeleteAction {
  return function (
    payload: PlainObject | PlainObject[] | string | string[],
    pluginModuleConfig: VueSyncPluginModuleConfig
  ): void {
    const payloadArray = isArray(payload) ? payload : [payload]
    // this mocks an error during execution
    const shouldFailProp = isString(payloadArray[0]) ? payloadArray[0] : payloadArray[0].shouldFail
    const shouldFail = shouldFailProp === storeName
    if (shouldFail) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // this is custom logic to be implemented by the plugin author
    const { path } = pluginModuleConfig
    const isCollection = isModuleCollection(pluginModuleConfig)
    const isDocument = !isCollection
    const db = pathToProp(moduleData, path)

    for (const idOrPayload of payloadArray) {
      const id = isString(idOrPayload) ? idOrPayload : idOrPayload.id
      if (isCollection) {
        db[id] = undefined
      }
      if (isDocument) {
        db[id] = undefined
      }
    }
  }
}

export function getActionFactory (
  moduleData: PlainObject,
  storeName: string,
  makeDataSnapshot: any
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig,
    mustExecuteOnGet: MustExecuteOnGet
  ): Promise<void | PlainObject | PlainObject[]> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()

    // this mocks an error during execution
    if (payload && payload.shouldFail === storeName) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }

    // let's pass a new event that will make sure this plugin's data is kept up to date with the server data
    // this mocks how the result from the next store (the remote store) should be merged into the local stores
    mustExecuteOnGet.registerDoOnAdded((payload, meta) =>
      writeActionFactory(moduleData, 'insert', storeName)(payload, pluginModuleConfig)
    )
    // in case of a local store that doesn't fetch from anywhere, not even from cach, we could return early here
    return
  }
}

export function streamActionFactory (
  moduleData: PlainObject,
  storeName: string
): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    pluginModuleConfig: VueSyncPluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnRead | Promise<StreamResponse | DoOnRead> => {
    // this mocks an error during execution
    if (payload && payload.shouldFail === storeName) {
      const errorToThrow: VueSyncError = {
        payload,
        message: 'fail',
      }
      throw errorToThrow
    }
    // this is custom logic to be implemented by the plugin author
    // this mocks how the result from the next store (the remote store) should update this local store per action type
    // hover over the prop names below to see more info on when they are triggered:
    const doOnRead: DoOnRead = {
      added: (payload, meta) =>
        writeActionFactory(moduleData, 'insert', storeName)(payload, pluginModuleConfig),
      modified: (payload, meta) =>
        writeActionFactory(moduleData, 'insert', storeName)(payload, pluginModuleConfig),
      removed: (payload, meta) =>
        deleteActionFactory(moduleData, storeName)(payload, pluginModuleConfig),
    }
    return doOnRead
  }
}
