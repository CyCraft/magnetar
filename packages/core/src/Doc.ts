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
import { actionNameTypeMap } from '@magnetarjs/types'
import {
  executeSetupModulePerStore,
  getDataFromDataStore,
  getExistsFromDataStore,
  proxify,
} from './helpers/moduleHelpers'
import {
  handleActionPerStore,
  HandleActionSharedParams,
} from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'

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
  }
): DocInstance {
  const { writeLockMap, fetchPromises, cacheStream, streaming, closeStream } = streamAndFetchPromises // prettier-ignore

  const path = [collectionPath, docId].join('/')

  const collection: CollectionFn = (collectionId, _moduleConfig = {}) => {
    return collectionFn(`${path}/${collectionId}`, _moduleConfig)
  }

  const sharedParams: HandleActionSharedParams = {
    collectionPath,
    _docId: docId,
    moduleConfig,
    globalConfig,
    fetchPromises,
    writeLockMap,
    docFn,
  }
  const actions = {
    insert: (handleActionPerStore(sharedParams, 'insert', actionNameTypeMap.insert) as MagnetarInsertAction), // prettier-ignore
    merge: (handleActionPerStore(sharedParams, 'merge', actionNameTypeMap.merge) as MagnetarWriteAction), // prettier-ignore
    assign: (handleActionPerStore(sharedParams, 'assign', actionNameTypeMap.assign) as MagnetarWriteAction), // prettier-ignore
    replace: (handleActionPerStore(sharedParams, 'replace', actionNameTypeMap.replace) as MagnetarWriteAction), // prettier-ignore
    deleteProp: (handleActionPerStore(sharedParams, 'deleteProp', actionNameTypeMap.deleteProp) as MagnetarDeletePropAction), // prettier-ignore
    delete: (handleActionPerStore(sharedParams, 'delete', actionNameTypeMap.delete) as MagnetarDeleteAction), // prettier-ignore
    fetch: (handleActionPerStore(sharedParams, 'fetch', actionNameTypeMap.fetch) as MagnetarFetchAction<Record<string, unknown>, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streaming, cacheStream, writeLockMap), // prettier-ignore
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
