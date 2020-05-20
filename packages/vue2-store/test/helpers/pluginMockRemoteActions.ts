import { pick } from 'filter-anything'
import {
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  StreamResponse,
  DoOnStream,
  PluginGetAction,
  PluginRevertAction,
  PluginDeletePropAction,
  PluginInsertAction,
  DoOnGet,
  GetResponse,
  PlainObject,
  PluginStreamActionPayload,
  PluginRevertActionPayload,
  PluginGetActionPayload,
  PluginDeleteActionPayload,
  PluginDeletePropActionPayload,
  PluginInsertActionPayload,
  PluginWriteActionPayload,
} from '@vue-sync/core'
import { StorePluginModuleConfig, RemoteStoreOptions } from './pluginMockRemote'
import { waitMs } from './wait'
import { pokedexMap } from './pokedex'
import { throwIfEmulatedError } from './throwFns'
import { generateRandomId } from './generateRandomId'
import { filterDataPerClauses } from './pluginMockRemoteHelpers'

export function writeActionFactory (
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

export function insertActionFactory (storePluginOptions: RemoteStoreOptions): PluginInsertAction {
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

export function deletePropActionFactory (
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

export function deleteActionFactory (storePluginOptions: RemoteStoreOptions): PluginDeleteAction {
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

function mockDataRetrieval (
  moduleType: 'collection' | 'doc',
  pluginModuleConfig: StorePluginModuleConfig
): PlainObject[] {
  if (moduleType === 'doc') return [{ name: 'Luca', age: 10, dream: 'job' }]
  const _pokedexMap = pokedexMap()
  const clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit'])
  const filteredMap = filterDataPerClauses(_pokedexMap, clauses)
  return [...filteredMap.values()]
}

export function getActionFactory (storePluginOptions: RemoteStoreOptions): PluginGetAction {
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginGetActionPayload<StorePluginModuleConfig>): Promise<DoOnGet | GetResponse> {
    // this is custom logic to be implemented by the plugin author

    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved = mockDataRetrieval(docId ? 'doc' : 'collection', pluginModuleConfig)
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

export function streamActionFactory (storePluginOptions: RemoteStoreOptions): PluginStreamAction {
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
      ? mockDataRetrieval('collection', pluginModuleConfig)
      : [
          { name: 'Luca', age: 10 },
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
      const waitTime = 10 + i * 200
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

export function revertActionFactory (storePluginOptions: RemoteStoreOptions): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return async function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
    actionName,
  }: PluginRevertActionPayload<StorePluginModuleConfig>): Promise<void> {
    // reverting on read actions is not neccesary
    const isReadAction = ['get', 'stream'].includes(actionName)
    if (isReadAction) return

    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
  }
}
