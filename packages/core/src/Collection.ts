import { O } from 'ts-toolbelt'
import { merge, mergeAndConcat } from 'merge-anything'
import {
  MagnetarFetchAction,
  MagnetarStreamAction,
  MagnetarInsertAction,
  MagnetarDeleteAction,
  FetchPromises,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import {
  handleActionPerStore,
  HandleActionSharedParams,
} from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { DocFn, CollectionFn, WriteLock } from './Magnetar'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'
import { WhereClause, WhereFilterOp, OrderByClause } from './types/clauses'
import { OPaths } from './types/helpers'

export type CollectionInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
  /**
   * The cached data that was written or read so far
   */
  data: Map<string, DocDataType>
  /**
   * `doc` is available on every collection for chaining
   * @see {@link DocFn}
   * @example collection('pokedex').doc('001')
   */
  doc: DocFn<DocDataType>
  /**
   * The id of the collection. When this is a nested collection, it will not include the full path, only the final part
   * @example 'items'
   */
  id: string
  /**
   * The full path of the collection
   * @example 'pokedex/001/items'
   * @example 'pokedex'
   */
  path: string
  /**
   * Returns the open stream promise of this collection, dependant on which `where`/`limit`/`orderBy` filters was used.
   *
   * Returns `null` when there is no open stream.
   *
   * This promise will resolve when `collection().closeStream()` is called, or when the stream closed because of an error.
   */
  streaming: () => Promise<void> | null
  /**
   * Close the stream of this collection, dependant on which `where`/`limit`/`orderBy` filters was used.
   *
   * Does nothing if there is no open stream.
   */
  closeStream: () => void
  /**
   * Close all streams of this collection, no matter which `where`/`limit`/`orderBy` filters were used.
   *
   * Does nothing if there are no open streams.
   */
  closeAllStreams: () => void

  // actions
  /**
   * @see {@link MagnetarFetchAction}
   */
  fetch: MagnetarFetchAction<DocDataType, 'collection'>
  /**
   * @see {@link MagnetarStreamAction}
   */
  stream: MagnetarStreamAction
  /**
   * @see {@link MagnetarInsertAction}
   */
  insert: MagnetarInsertAction<DocDataType>
  /**
   * @see {@link MagnetarDeleteAction}
   */
  delete: MagnetarDeleteAction

  // filters
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  orderBy: (
    fieldPath: OPaths<DocDataType, 4>,
    direction?: 'asc' | 'desc'
  ) => CollectionInstance<DocDataType>
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  limit: (limitCount: number) => CollectionInstance<DocDataType>
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  where: (
    fieldPath: OPaths<DocDataType, 4>,
    operator: WhereFilterOp,
    value: any
  ) => CollectionInstance<DocDataType>
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  startAfter: (...values: string[]) => CollectionInstance<DocDataType>
}

export function createCollectionWithContext<DocDataType extends Record<string, any>>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn<DocDataType>,
  streamAndFetchPromises: {
    writeLockMap: Map<string, WriteLock>
    fetchPromises: FetchPromises
    cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void
    streaming: () => Promise<void> | null
    closeStream: () => void
    closeAllStreams: () => void
  }
): CollectionInstance<DocDataType> {
  const { writeLockMap, fetchPromises, cacheStream, streaming, closeStream, closeAllStreams } = streamAndFetchPromises // prettier-ignore

  const id = collectionPath.split('/').slice(-1)[0]
  const path = collectionPath

  const doc: DocFn<DocDataType> = (docId: string, _moduleConfig: ModuleConfig = {}) => {
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
  const insert = handleActionPerStore(sharedParams, 'insert', actionNameTypeMap.insert) as MagnetarInsertAction<DocDataType> //prettier-ignore
  const _delete = handleActionPerStore(sharedParams, 'delete', actionNameTypeMap.delete) as MagnetarDeleteAction //prettier-ignore
  const fetch = handleActionPerStore(sharedParams, 'fetch', actionNameTypeMap.fetch) as MagnetarFetchAction<DocDataType, 'collection'> //prettier-ignore
  const stream = handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streaming, cacheStream, writeLockMap) // prettier-ignore

  const actions = { stream, fetch, insert, delete: _delete }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  function where(
    fieldPath: OPaths<DocDataType, 4>,
    operator: WhereFilterOp,
    value: any
  ): CollectionInstance<DocDataType> {
    const whereClause: WhereClause = [fieldPath, operator, value]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { where: [whereClause] })
    return collectionFn(path, moduleConfigWithClause)
  }

  function orderBy(
    fieldPath: OPaths<DocDataType, 4>,
    direction: 'asc' | 'desc' = 'asc'
  ): CollectionInstance<DocDataType> {
    const orderByClause: OrderByClause = [fieldPath, direction]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { orderBy: [orderByClause] })
    return collectionFn(path, moduleConfigWithClause)
  }

  function limit(limitCount: number): CollectionInstance<DocDataType> {
    return collectionFn(path, { ...moduleConfig, limit: limitCount })
  }

  function startAfter(...values: any[]): CollectionInstance<DocDataType> {
    return collectionFn(path, { ...moduleConfig, startAfter: values })
  }

  const queryFns = { where, orderBy, limit, startAfter }

  const moduleInstance: Omit<CollectionInstance<DocDataType>, 'data'> = {
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
  const dataProxyHandler = getDataProxyHandler<'collection', DocDataType>(
    [collectionPath, docId],
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
