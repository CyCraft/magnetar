import type {
  CollectionFn,
  CollectionInstance,
  DocFn,
  FetchMetaDataCollection,
  FetchPromises,
  GlobalConfig,
  MagnetarDeleteAction,
  MagnetarFetchAction,
  MagnetarFetchAverageAction,
  MagnetarFetchCountAction,
  MagnetarFetchSumAction,
  MagnetarInsertAction,
  ModuleConfig,
  OrderByClause,
  QueryClause,
  WhereClause,
  WhereFilterOp,
  WriteLock,
} from '@magnetarjs/types'
import { merge, mergeAndConcat } from 'merge-anything'
import {
  executeSetupModulePerStore,
  getAggregateFromDataStore,
  getCountFromDataStore,
  getDataFromDataStore,
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

export function createCollectionWithContext(
  collectionPath: string,
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
    closeAllStreams: () => void
  },
  fetchMeta: {
    get: () => FetchMetaDataCollection
    set: (payload: FetchMetaDataCollection) => void
  },
): CollectionInstance {
  const { writeLockMap, fetchPromises, cacheStream, streaming, closeStream, closeAllStreams } = streamAndFetchPromises // prettier-ignore

  const id = collectionPath.split('/').slice(-1)[0] ?? ''
  const path = collectionPath

  const doc: DocFn = ((docId: string, _moduleConfig: ModuleConfig = {}) => {
    return docFn(`${path}/${docId}`, merge(moduleConfig, _moduleConfig))
  }) as any

  const writeParams: HandleWritePerStoreParams = {
    collectionPath,
    _docId: undefined,
    moduleConfig,
    globalConfig,
    writeLockMap,
    docFn,
    collectionFn,
  }
  const fetchParams: HandleFetchPerStoreParams = {
    collectionPath,
    _docId: undefined,
    moduleConfig,
    globalConfig,
    fetchPromises,
    writeLockMap,
    docFn,
    collectionFn,
    setLastFetched: fetchMeta.set,
  }
  const insert = handleWritePerStore(writeParams, 'insert') as MagnetarInsertAction //prettier-ignore
  const _delete = handleWritePerStore(writeParams, 'delete') as MagnetarDeleteAction //prettier-ignore
  const fetch = handleFetchPerStore(fetchParams, 'fetch') as MagnetarFetchAction<{ [key: string]: unknown }, 'collection'> //prettier-ignore
  const fetchCount = handleFetchPerStore(fetchParams, 'fetchCount') as MagnetarFetchCountAction // prettier-ignore
  const fetchSum = handleFetchPerStore(fetchParams, 'fetchSum') as MagnetarFetchSumAction // prettier-ignore
  const fetchAverage = handleFetchPerStore(fetchParams, 'fetchAverage') as MagnetarFetchAverageAction // prettier-ignore
  const stream = handleStreamPerStore([collectionPath, undefined], moduleConfig, globalConfig, 'write', streaming, cacheStream, writeLockMap) // prettier-ignore

  const actions = { stream, fetch, fetchCount, fetchSum, fetchAverage, insert, delete: _delete }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, undefined], moduleConfig)

  function query(query: QueryClause): CollectionInstance {
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { query: [query] })
    return collectionFn(path, moduleConfigWithClause)
  }

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
    if (values[0] === undefined) return collectionFn(path, moduleConfig)

    const isDoc = values[0] && typeof values[0] === 'object'
    return collectionFn(path, {
      ...moduleConfig,
      startAfter: isDoc ? (values[0] as object) : values,
    })
  }

  const queryFns = { query, where, orderBy, limit, startAfter }

  const moduleInstance: Omit<CollectionInstance, 'data' | 'fetched' | 'count' | 'sum' | 'average'> =
    {
      doc,
      id,
      path,
      streaming,
      closeStream,
      closeAllStreams,
      ...actions,
      ...queryFns,
    }

  return proxify(moduleInstance, {
    count: () => getCountFromDataStore(moduleConfig, globalConfig, collectionPath),
    sum: () => getAggregateFromDataStore('sum', moduleConfig, globalConfig, collectionPath),
    average: () => getAggregateFromDataStore('average', moduleConfig, globalConfig, collectionPath),
    data: () => getDataFromDataStore(moduleConfig, globalConfig, collectionPath),
    fetched: fetchMeta.get,
  })
}
