import { O } from 'ts-toolbelt'
import { merge, mergeAndConcat } from 'merge-anything'
import {
  MagnetarFetchAction,
  MagnetarInsertAction,
  MagnetarDeleteAction,
  FetchPromises,
  ModuleConfig,
  GlobalConfig,
  DocFn,
  CollectionFn,
  WriteLock,
  OPaths,
  WhereClause,
  WhereFilterOp,
  OrderByClause,
  actionNameTypeMap,
  CollectionInstance,
} from '@magnetarjs/types'
import {
  handleActionPerStore,
  HandleActionSharedParams,
} from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'

export function createCollectionWithContext(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn,
  collectionFn: CollectionFn,
  streamAndFetchPromises: {
    writeLockMap: Map<string, WriteLock>
    fetchPromises: FetchPromises
    cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void
    streaming: () => Promise<void> | null
    closeStream: () => void
    closeAllStreams: () => void
  }
): CollectionInstance {
  const { writeLockMap, fetchPromises, cacheStream, streaming, closeStream, closeAllStreams } = streamAndFetchPromises // prettier-ignore

  const id = collectionPath.split('/').slice(-1)[0]
  const path = collectionPath

  const doc: DocFn = (docId: string, _moduleConfig: ModuleConfig = {}) => {
    return docFn(`${path}/${docId}`, merge(moduleConfig, _moduleConfig))
  }

  const sharedParams: HandleActionSharedParams = {
    collectionPath,
    _docId: docId,
    moduleConfig,
    globalConfig,
    fetchPromises,
    writeLockMap,
    docFn,
    collectionFn,
  }
  const insert = handleActionPerStore(sharedParams, 'insert', actionNameTypeMap.insert) as MagnetarInsertAction //prettier-ignore
  const _delete = handleActionPerStore(sharedParams, 'delete', actionNameTypeMap.delete) as MagnetarDeleteAction //prettier-ignore
  const fetch = handleActionPerStore(sharedParams, 'fetch', actionNameTypeMap.fetch) as MagnetarFetchAction<Record<string, unknown>, 'collection'> //prettier-ignore
  const stream = handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streaming, cacheStream, writeLockMap) // prettier-ignore

  const actions = { stream, fetch, insert, delete: _delete }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  function where(fieldPath: string, operator: WhereFilterOp, value: any): CollectionInstance {
    const whereClause: WhereClause = [fieldPath, operator, value]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { where: [whereClause] })
    return collectionFn(path, moduleConfigWithClause)
  }

  function orderBy(fieldPath: string, direction: 'asc' | 'desc' = 'asc'): CollectionInstance {
    const orderByClause: OrderByClause = [fieldPath, direction]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { orderBy: [orderByClause] })
    return collectionFn(path, moduleConfigWithClause)
  }

  function limit(limitCount: number): CollectionInstance {
    return collectionFn(path, { ...moduleConfig, limit: limitCount })
  }

  function startAfter(...values: unknown[]): CollectionInstance {
    const isDoc = values[0] && typeof values[0] === 'object'
    return collectionFn(path, {
      ...moduleConfig,
      startAfter: isDoc ? (values[0] as object) : values,
    })
  }

  const queryFns = { where, orderBy, limit, startAfter }

  const moduleInstance: Omit<CollectionInstance, 'data'> = {
    doc,
    id,
    path,
    streaming,
    closeStream,
    closeAllStreams,
    ...actions,
    ...queryFns,
  }

  /**
   * The data returned by the store specified as 'localStoreName'
   */
  const dataProxyHandler = getDataProxyHandler<'collection', Record<string, unknown>>(
    [collectionPath, docId],
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
