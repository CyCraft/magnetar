import type {
  Clauses,
  DoOnFetch,
  DoOnFetchAggregate,
  DoOnStream,
  FetchAggregateResponse,
  FetchResponse,
  PluginDeleteAction,
  PluginDeleteActionPayload,
  PluginDeletePropAction,
  PluginDeletePropActionPayload,
  PluginFetchAction,
  PluginFetchActionPayload,
  PluginFetchAggregateAction,
  PluginFetchAggregateActionPayload,
  PluginFetchCountAction,
  PluginFetchCountActionPayload,
  PluginInsertAction,
  PluginRevertAction,
  PluginRevertActionPayload,
  PluginStreamAction,
  PluginStreamActionPayload,
  PluginWriteAction,
  StreamResponse,
  SyncBatch,
} from '@magnetarjs/types'
import { filterDataPerClauses } from '@magnetarjs/utils'
import { isFullArray, isFullString, isNumber, isPromise, isString } from 'is-what'
import { getProp } from 'path-to-prop'
import { generateRandomId, pokedexMap, throwIfEmulatedError, waitMs } from '../helpers/index.js'
import { RemoteStoreOptions, StorePluginModuleConfig } from './index.js'

export function writeActionFactory(
  storePluginOptions: RemoteStoreOptions,
  actionName: 'merge' | 'assign' | 'replace',
): PluginWriteAction {
  const write: PluginWriteAction = async ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }) => {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    // any write action other than `insert` cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')

    const syncBatch: SyncBatch = {
      insert: new Map(),
      assign: new Map(),
      merge: new Map(),
      replace: new Map(),
      deleteProp: new Map(),
      delete: new Set(),
    }

    return syncBatch
  }
  return write
}

export function insertActionFactory(storePluginOptions: RemoteStoreOptions): PluginInsertAction {
  const insert: PluginInsertAction = async ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }) => {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    const syncBatch: SyncBatch = {
      insert: new Map(),
      assign: new Map(),
      merge: new Map(),
      replace: new Map(),
      deleteProp: new Map(),
      delete: new Set(),
    }

    const id = docId || generateRandomId()
    syncBatch.insert.set(id, payload)
    return [id, syncBatch]
  }
  return insert
}

export function deletePropActionFactory(
  storePluginOptions: RemoteStoreOptions,
): PluginDeletePropAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginDeletePropActionPayload<StorePluginModuleConfig>): Promise<undefined> {
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
  }: PluginDeleteActionPayload<StorePluginModuleConfig>): Promise<undefined> {
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
  pluginModuleConfig: StorePluginModuleConfig,
): { [key: string]: unknown }[] {
  if (docId === 'trainer') return [{ name: 'Luca', age: 10, dream: 'job' }]

  if (collectionPath === 'pokedex') {
    const _pokedexMap = pokedexMap()

    if (isString(docId)) {
      const result = _pokedexMap.get(docId)
      return result ? [result] : []
    }

    const clauses: Clauses = pluginModuleConfig
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
        const results = dataRetrieved.map((_data: { [key: string]: any }) => {
          const _metaData = {
            data: _data,
            exists: true,
            id: isFullString(_data['id'])
              ? _data['id']
              : isNumber(_data['id'])
                ? `${_data['id']}`
                : docId || '',
          }
          return _metaData
        })
        resolve({ docs: results })
      }, 1)
    })
  }
}

export function fetchCountActionFactory(
  storePluginOptions: RemoteStoreOptions,
): PluginFetchCountAction {
  return async function ({
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchCountActionPayload<StorePluginModuleConfig>): Promise<
    DoOnFetchAggregate | FetchAggregateResponse
  > {
    // this is custom logic to be implemented by the plugin author

    // this mocks an error during execution
    // throwIfEmulatedError(payload, storePluginOptions)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved = mockDataRetrieval(collectionPath, undefined, pluginModuleConfig)
        resolve(dataRetrieved.length)
      }, 1)
    })
  }
}

export function fetchAggregateActionFactory(
  kind: 'sum' | 'average',
  storePluginOptions: RemoteStoreOptions,
): PluginFetchAggregateAction {
  return async function ({
    payload,
    collectionPath,
    pluginModuleConfig,
  }: PluginFetchAggregateActionPayload<StorePluginModuleConfig>): Promise<
    DoOnFetchAggregate | FetchAggregateResponse
  > {
    // this is custom logic to be implemented by the plugin author

    // this mocks an error during execution
    // throwIfEmulatedError(payload, storePluginOptions)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved = mockDataRetrieval(collectionPath, undefined, pluginModuleConfig)
        const total = dataRetrieved.reduce((total, obj) => {
          const value = getProp(obj, payload)
          if (!isNumber(value)) return total
          return total + value
        }, 0)
        if (kind === 'sum') {
          resolve(total)
        } else if (kind === 'average') {
          resolve(total / dataRetrieved.length)
        } else {
          resolve(NaN)
        }
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
    actionConfig,
    mustExecuteOnRead,
  }: PluginStreamActionPayload<StorePluginModuleConfig>): Promise<StreamResponse | DoOnStream> {
    // this is custom logic to be implemented by the plugin author

    // Extract onFirstData callback from payload if provided
    const onFirstData = payload?.onFirstData
    let firstDataProcessed = false

    // Check if streamSendsData is provided in config (for testing)
    const streamSendsData = (actionConfig as any)?.streamSendsData

    // we'll mock opening a stream
    const dataRetrieved = streamSendsData
      ? isFullArray(streamSendsData)
        ? streamSendsData
        : [streamSendsData]
      : !docId
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

    // If streamSendsData is provided, send all data at setTimeout 10, then trigger onFirstData
    if (streamSendsData) {
      setTimeout(() => {
        if (stopStreaming.stopped) return
        // Send all items
        dataRetrieved.forEach((data: { [key: string]: any }) => {
          if (data) {
            const metaData = { data, id: data['id'] || docId, exists: true }
            mustExecuteOnRead.added(data, metaData)
          }
        })
        // After all items are sent, trigger onFirstData
        if (!firstDataProcessed && onFirstData && dataRetrieved.length > 0) {
          firstDataProcessed = true
          setTimeout(() => onFirstData({ empty: false }), 0)
        }
      }, 10)
    } else {
      // this mocks actual data coming in at different intervals
      dataRetrieved.forEach((data: { [key: string]: any }, i) => {
        const metaData = { data, id: data['id'] || docId, exists: true }

        // we can simulate new docs coming in by manually triggerering promises
        if (isFullArray(payload) && payload.every(isPromise)) {
          // the payload is an array full of promises!
          // in this case we will emit every time the promises at the index is triggered
          const promise = payload[i]
          if (!promise) return
          promise.then(() => {
            if (data) {
              // Call onFirstData on first data processed
              if (!firstDataProcessed && onFirstData) {
                firstDataProcessed = true
                setTimeout(() => onFirstData({ empty: false }), 0)
              }
              mustExecuteOnRead.added(data, metaData)
            }
          })
          return
        }

        // otherwise emulate server response with setTimeout (can be wonky in automated tests)
        const waitTime = 10 + i * 200
        setTimeout(() => {
          // mock when the stream is already stopped
          if (stopStreaming.stopped) return
          // else go ahead and actually trigger the mustExecuteOnRead function
          if (data) {
            // Call onFirstData on first data processed
            if (!firstDataProcessed && onFirstData) {
              firstDataProcessed = true
              setTimeout(() => onFirstData({ empty: false }), 0)
            }
            mustExecuteOnRead.added(data, metaData)
          }
        }, waitTime)
      })
    }

    // If no data is expected and onFirstData is provided, call it immediately
    if (onFirstData && !firstDataProcessed && dataRetrieved.length === 0) {
      // For empty collections, call onFirstData immediately
      setTimeout(() => {
        if (!firstDataProcessed) {
          firstDataProcessed = true
          setTimeout(() => onFirstData({ empty: true }), 0)
        }
      }, 0)
    }

    // this mocks the opening of the stream
    const streaming = new Promise<void>((resolve, reject) => {
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
