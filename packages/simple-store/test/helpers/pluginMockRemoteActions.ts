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
import { SimpleStoreModuleConfig, StorePluginOptions } from './pluginMockRemote'
import { waitMs } from './wait'
import { pokedex } from './pokemon'
import { throwIfEmulatedError } from './throwFns'
import { generateRandomId } from './generateRandomId'

export function writeActionFactory (
  storePluginOptions: StorePluginOptions,
  actionName: 'merge' | 'assign' | 'replace'
): PluginWriteAction {
  return async function (
    payload: PlainObject,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    await waitMs(1)

    const isCollection = isCollectionModule(modulePath)
    // any write action other than `insert` cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function insertActionFactory (storePluginOptions: StorePluginOptions): PluginInsertAction {
  return async function (
    payload: PlainObject,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<string> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
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
  storePluginOptions: StorePluginOptions
): PluginDeletePropAction {
  return async function (
    payload: string | string[],
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    await waitMs(1)

    const isCollection = isCollectionModule(modulePath)
    // `deleteProp` action cannot be executed on collections
    if (isCollection) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function deleteActionFactory (storePluginOptions: StorePluginOptions): PluginDeleteAction {
  return async function (
    payload: void,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    await waitMs(1)
    // this mocks an error during execution
  }
}

export function getActionFactory (storePluginOptions: StorePluginOptions): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig
  ): Promise<DoOnGet | GetResponse> => {
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const isCollection = isCollectionModule(modulePath)
    const isDocument = !isCollection

    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved: PlainObject[] = isCollection
          ? [pokedex(1), pokedex(136)]
          : [{ name: 'Luca', age: 10, dream: 'job' }]
        // we must trigger `mustExecuteOnGet.added` for each document that was retrieved and return whatever that returns
        const results = dataRetrieved.map(_data => {
          const _metaData = { data: _data, id: String(_data.id) || docId, exists: true }
          return _metaData
        })
        resolve({ docs: results })
      }, 1)
    })
  }
}

export function streamActionFactory (storePluginOptions: StorePluginOptions): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const isCollection = isCollectionModule(modulePath)
    const isDocument = !isCollection
    // we'll mock opening a stream

    const dataRetrieved = isCollection
      ? [pokedex(1), pokedex(136), pokedex(4)]
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
    dataRetrieved.forEach((_data, i) => {
      const waitTime = 10 + i * 500
      setTimeout(() => {
        // mock when the stream is already stopped
        if (stopStreaming.stopped) return
        // else go ahead and actually trigger the mustExecuteOnRead function
        const metaData = { data: _data, id: String(_data.id) || docId, exists: true }
        mustExecuteOnRead.added(_data, metaData)
      }, waitTime)
    })

    // this mocks the opening of the stream
    const streaming: Promise<void> = new Promise((resolve, reject): void => {
      stopStreaming.stop = resolve
      setTimeout(() => {
        // this mocks an error during execution
        throwIfEmulatedError(payload, storePluginOptions)
      }, 1)
    })
    function stop (): void {
      stopStreaming.stopped = true
      stopStreaming.stop()
    }
    return { streaming, stop }
  }
}

export function revertActionFactory (storePluginOptions: StorePluginOptions): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return async function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    modulePath: string,
    simpleStoreModuleConfig: SimpleStoreModuleConfig,
    actionName: ActionName
  ): Promise<void> {
    await waitMs(1)
  }
}
