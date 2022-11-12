import { pick } from 'filter-anything'
import {
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  PluginFetchAction,
  PluginRevertAction,
  PluginDeletePropAction,
  PluginInsertAction,
  DoOnFetch,
  FetchResponse,
  PluginStreamActionPayload,
  PluginRevertActionPayload,
  PluginFetchActionPayload,
  PluginDeleteActionPayload,
  PluginDeletePropActionPayload,
  PluginInsertActionPayload,
  PluginWriteActionPayload,
  Clauses,
} from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { StorePluginModuleConfig, RemoteStoreOptions } from './index'
import { throwIfEmulatedError, waitMs, pokedexMap, generateRandomId } from '../helpers'
import { isFullArray, isPromise } from 'is-what'

export function writeActionFactory(
  storePluginOptions: RemoteStoreOptions,
  actionName: 'merge' | 'assign' | 'replace'
): PluginWriteAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginWriteActionPayload<StorePluginModuleConfig>): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    // any write action other than `insert` cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function insertActionFactory(storePluginOptions: RemoteStoreOptions): PluginInsertAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<StorePluginModuleConfig>): Promise<string> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    if (!docId) {
      const id = generateRandomId()
      return id
    }
    return docId
  }
}

export function deletePropActionFactory(
  storePluginOptions: RemoteStoreOptions
): PluginDeletePropAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<StorePluginModuleConfig>): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function deleteActionFactory(storePluginOptions: RemoteStoreOptions): PluginDeleteAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeleteActionPayload<StorePluginModuleConfig>): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
    // this mocks an error during execution
  }
}

function mockDataRetrieval(
  collectionPath: string | undefined,
  docId: string | undefined,
  pluginModuleConfig: StorePluginModuleConfig
): Record<string, unknown>[] {
  if (docId === 'trainer') return [{ name: 'Luca', age: 10, dream: 'job' }]

  if (collectionPath === 'pokedex') {
    const _pokedexMap = pokedexMap()

    if (docId) {
      const result = _pokedexMap.get(docId)
      return result ? [result] : []
    }

    const clauses: Clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit', 'startAfter'])
    const filteredMap = filterDataPerClauses(_pokedexMap, clauses)
    return [...filteredMap.values()]
  }
  return []
}

export function fetchActionFactory(storePluginOptions: RemoteStoreOptions): PluginFetchAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginFetchActionPayload<StorePluginModuleConfig>): Promise<DoOnFetch | FetchResponse> {
    // this is custom logic to be implemented by the plugin author

    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved = mockDataRetrieval(collectionPath, docId, pluginModuleConfig)
        // we must trigger `mustExecuteOnGet.added` for each document that was retrieved and return whatever that returns
        const results = dataRetrieved.map((_data: Record<string, any>) => {
          const _metaData = { data: _data, exists: true, id: _data.id || docId }
          return _metaData
        })
        resolve({ docs: results })
      }, 1)
    })
  }
}

export function streamActionFactory(storePluginOptions: RemoteStoreOptions): PluginStreamAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<StorePluginModuleConfig>): Promise<StreamResponse | DoOnStream> {
    // this is custom logic to be implemented by the plugin author

    // we'll mock opening a stream
    const dataRetrieved = !docId
      ? mockDataRetrieval(collectionPath, docId, pluginModuleConfig)
      : [
          { name: 'Luca', age: 10 },
          { name: 'Luca', age: 10 },
          { name: 'Luca', age: 10, dream: 'job' },
          { name: 'Luca', age: 10, dream: 'job', colour: 'blue' },
        ]
    const stopStreaming = {
      stopped: false,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      stop: () => {},
    }
    // this mocks actual data coming in at different intervals
    dataRetrieved.forEach((data: Record<string, any>, i) => {
      const metaData = { data, id: data.id || docId, exists: true }

      // we can simulate new docs coming in by manually triggerering promises
      if (isFullArray(payload) && payload.every(isPromise)) {
        // the payload is an array full of promises!
        // in this case we will emit every time the promises at the index is triggered
        const promise = payload[i]
        if (!promise) return
        promise.then(() => {
          if (data) mustExecuteOnRead.added(data, metaData)
        })
        return
      }

      // otherwise emulate server response with setTimeout (can be wonky in automated tests)
      const waitTime = 10 + i * 200
      setTimeout(() => {
        // mock when the stream is already stopped
        if (stopStreaming.stopped) return
        // else go ahead and actually trigger the mustExecuteOnRead function
        if (data) mustExecuteOnRead.added(data, metaData)
      }, waitTime)
    })

    // this mocks the opening of the stream
    const streaming: Promise<void> = new Promise((resolve, reject): void => {
      stopStreaming.stop = resolve
      setTimeout(() => {
        // this mocks an error during execution
        try {
          throwIfEmulatedError(payload, storePluginOptions)
        } catch (e) {
          reject(e)
        }
      }, 1)
    })
    function stop(): void {
      stopStreaming.stopped = true
      stopStreaming.stop()
    }
    return { streaming, stop }
  }
}

export function revertActionFactory(storePluginOptions: RemoteStoreOptions): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
  }: PluginRevertActionPayload<StorePluginModuleConfig>): Promise<void> {
    // reverting on read actions is not neccesary
    const isReadAction = ['fetch', 'stream'].includes(actionName)
    if (isReadAction) return

    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
  }
}
