import type {
  CollectionFn,
  DocFn,
  DocInstance,
  FetchPromises,
  GlobalConfig,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarFetchAction,
  MagnetarInsertAction,
  MagnetarWriteAction,
  ModuleConfig,
  WriteLock,
} from '@magnetarjs/types'
import {
  executeSetupModulePerStore,
  getDataFromDataStore,
  getExistsFromDataStore,
  proxify,
} from './helpers/moduleHelpers.js'
import {
  HandleFetchPerStoreParams,
  handleFetchPerStore,
} from './moduleActions/handleFetchPerStore.js'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore.js'
import {
  HandleWritePerStoreParams,
  handleWritePerStore,
} from './moduleActions/handleWritePerStore.js'

export function createDocWithContext(
  [collectionPath, docId]: [string, string],
  moduleConfig: ModuleConfig,
  globalConfig: Required<GlobalConfig>,
  docFn: DocFn,
  collectionFn: CollectionFn,
  streamAndFetchPromises: {
    writeLockMap: Map<string, WriteLock>
    fetchPromises: FetchPromises
    cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void
    streaming: () => Promise<void> | null
    closeStream: () => void
  },
): DocInstance {
  const { writeLockMap, fetchPromises, cacheStream, streaming, closeStream } = streamAndFetchPromises // prettier-ignore

  const path = [collectionPath, docId].join('/')

  const collection: CollectionFn = (collectionId, _moduleConfig = {}) => {
    return collectionFn(`${path}/${collectionId}`, _moduleConfig)
  }

  const writeParams: HandleWritePerStoreParams = {
    collectionPath,
    _docId: docId,
    moduleConfig,
    globalConfig,
    writeLockMap,
    docFn,
  }
  const fetchParams: HandleFetchPerStoreParams = {
    collectionPath,
    _docId: docId,
    moduleConfig,
    globalConfig,
    fetchPromises,
    writeLockMap,
    docFn,
  }
  const actions = {
    insert: (handleWritePerStore(writeParams, 'insert') as MagnetarInsertAction), // prettier-ignore
    merge: (handleWritePerStore(writeParams, 'merge') as MagnetarWriteAction), // prettier-ignore
    assign: (handleWritePerStore(writeParams, 'assign') as MagnetarWriteAction), // prettier-ignore
    replace: (handleWritePerStore(writeParams, 'replace') as MagnetarWriteAction), // prettier-ignore
    deleteProp: (handleWritePerStore(writeParams, 'deleteProp') as MagnetarDeletePropAction), // prettier-ignore
    delete: (handleWritePerStore(writeParams, 'delete') as MagnetarDeleteAction), // prettier-ignore
    fetch: (handleFetchPerStore(fetchParams, 'fetch') as MagnetarFetchAction<{ [key: string]: unknown }, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, 'write', streaming, cacheStream, writeLockMap), // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  const moduleInstance: Omit<DocInstance, 'data' | 'exists'> = {
    collection,
    id: docId,
    path,
    streaming,
    closeStream,
    ...actions,
  }

  return proxify(moduleInstance, {
    data: () => getDataFromDataStore(moduleConfig, globalConfig, collectionPath, docId),
    exists: () => getExistsFromDataStore(globalConfig, collectionPath, docId),
  })
}
