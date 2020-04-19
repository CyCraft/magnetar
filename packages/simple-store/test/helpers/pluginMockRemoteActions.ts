import {
  ActionName,
  isCollectionModule,
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  MustExecuteOnRead,
  StreamResponse,
  DoOnStream,
  PluginGetAction,
  PluginRevertAction,
  PluginDeletePropAction,
  PluginInsertAction,
  DoOnGet,
  GetResponse,
  getCollectionPathDocIdEntry,
  PlainObject,
} from '@vue-sync/core'
import { StorePluginModuleConfig, StorePluginConfig } from './pluginMockRemote'
import { waitMs } from './wait'
import { bulbasaur, flareon, charmander } from './pokemon'
import { throwIfEmulatedError } from './throwFns'
import { generateRandomId } from './generateRandomId'

export function writeActionFactory (
  moduleData: PlainObject,
  actionName: 'merge' | 'assign' | 'replace',
  storePluginConfig: StorePluginConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginWriteAction {
  return async function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginConfig)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    const isCollection = isCollectionModule(modulePath)
    // any write action other than `insert` cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function insertActionFactory (
  moduleData: PlainObject,
  actionName: 'insert',
  storePluginConfig: StorePluginConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginInsertAction {
  return async function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<string> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginConfig)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    const isCollection = isCollectionModule(modulePath)

    if (isCollection) {
      const id = generateRandomId()
      return id
    }
    const docId = modulePath.split('/').slice(-1)[0]
    return docId
  }
}

export function deletePropActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storePluginConfig: StorePluginConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginDeletePropAction {
  return async function (
    payload: string | string[],
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginConfig)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    const isCollection = isCollectionModule(modulePath)
    // `deleteProp` action cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function deleteActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storePluginConfig: StorePluginConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginDeleteAction {
  return async function (
    payload: void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginConfig)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
    // this mocks an error during execution
  }
}

export function getActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storePluginConfig: StorePluginConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<DoOnGet | GetResponse> => {
    // this is custom logic to be implemented by the plugin author
    makeDataSnapshot()
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const isCollection = isCollectionModule(modulePath)
    const isDocument = !isCollection

    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginConfig)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved: PlainObject[] = isCollection
          ? [bulbasaur(), flareon()]
          : [{ name: 'Luca', age: 10, dream: 'job' }]
        // we must trigger `mustExecuteOnGet.added` for each document that was retrieved and return whatever that returns
        const results = dataRetrieved.map(_data => {
          const _metaData = { data: _data, exists: true, id: _data.id || docId }
          return _metaData
        })
        resolve({ docs: results })
      }, 1)
    })
  }
}

export function streamActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storePluginConfig: StorePluginConfig,
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
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const isCollection = isCollectionModule(modulePath)
    const isDocument = !isCollection
    // we'll mock opening a stream

    const dataRetrieved = isCollection
      ? [bulbasaur(), flareon(), charmander()]
      : [
          { name: 'Luca', age: 10 },
          { name: 'Luca', age: 10, dream: 'job' },
          { name: 'Luca', age: 10, dream: 'job', colour: 'blue' },
        ]
    const stopStreaming = {
      stopped: false,
      stop: () => {},
    }
    // this mocks actual data coming in at different intervals
    dataRetrieved.forEach((data, i) => {
      const waitTime = 10 + i * 500
      setTimeout(() => {
        // mock when the stream is already stopped
        if (stopStreaming.stopped) return
        // else go ahead and actually trigger the mustExecuteOnRead function
        const metaData = { data, id: data.id || docId, exists: true }
        mustExecuteOnRead.added(data, metaData)
      }, waitTime)
    })

    // this mocks the opening of the stream
    const streaming: Promise<void> = new Promise((resolve, reject): void => {
      stopStreaming.stop = resolve
      setTimeout(() => {
        // this mocks an error during execution
        throwIfEmulatedError(payload, storePluginConfig)
      }, 1)
    })
    function stop (): void {
      stopStreaming.stopped = true
      stopStreaming.stop()
    }
    return { streaming, stop }
  }
}

export function revertActionFactory (
  moduleData: PlainObject,
  actionName: ActionName | 'revert',
  storePluginConfig: StorePluginConfig,
  makeDataSnapshot?: any,
  restoreDataSnapshot?: any
): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return async function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig,
    actionName: ActionName
  ): Promise<void> {
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
  }
}
