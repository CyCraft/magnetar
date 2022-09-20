import { O } from 'ts-toolbelt'
import {
  MagnetarWriteAction,
  MagnetarFetchAction,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
  FetchPromises,
  actionNameTypeMap,
  ModuleConfig,
  GlobalConfig,
  CollectionFn,
  DocFn,
  WriteLock,
  DocInstance,
} from '@magnetarjs/types'
import {
  handleActionPerStore,
  HandleActionSharedParams,
} from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'

export function createDocWithContext<DocDataType extends Record<string, any>>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn,
  streamAndFetchPromises: {
    writeLockMap: Map<string, WriteLock>
    fetchPromises: FetchPromises
    cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void
    streaming: () => Promise<void> | null
    closeStream: () => void
  }
): DocInstance<DocDataType> {
  const { writeLockMap, fetchPromises, cacheStream, streaming, closeStream } = streamAndFetchPromises // prettier-ignore

  const id = docId
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
    insert: (handleActionPerStore(sharedParams, 'insert', actionNameTypeMap.insert) as MagnetarInsertAction<DocDataType>), // prettier-ignore
    merge: (handleActionPerStore(sharedParams, 'merge', actionNameTypeMap.merge) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    assign: (handleActionPerStore(sharedParams, 'assign', actionNameTypeMap.assign) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    replace: (handleActionPerStore(sharedParams, 'replace', actionNameTypeMap.replace) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    deleteProp: (handleActionPerStore(sharedParams, 'deleteProp', actionNameTypeMap.deleteProp) as MagnetarDeletePropAction<DocDataType>), // prettier-ignore
    delete: (handleActionPerStore(sharedParams, 'delete', actionNameTypeMap.delete) as MagnetarDeleteAction), // prettier-ignore
    fetch: (handleActionPerStore(sharedParams, 'fetch', actionNameTypeMap.fetch) as MagnetarFetchAction<DocDataType, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streaming, cacheStream, writeLockMap), // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  const moduleInstance: Omit<DocInstance<DocDataType>, 'data'> = {
    collection,
    id: id as string,
    path,
    streaming,
    closeStream,
    ...actions,
  }

  /**
   * The data returned by the store specified as 'localStoreName'
   */
  const dataProxyHandler = getDataProxyHandler<'doc', DocDataType>(
    [collectionPath, docId],
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
