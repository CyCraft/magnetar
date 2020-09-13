import { O } from 'ts-toolbelt'
import {
  MagnetarGetAction,
  MagnetarStreamAction,
  MagnetarInsertAction,
  OpenStreams,
  FindStream,
  OpenStreamPromises,
  FindStreamPromise,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { DocFn, CollectionFn } from './Magnetar'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'
import { WhereClause, WhereFilterOp, OrderByClause } from './types/clauses'
import { mergeAndConcat } from 'merge-anything'

export type CollectionInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  openStreams: OpenStreams
  findStream: FindStream
  openStreamPromises: OpenStreamPromises
  findStreamPromise: FindStreamPromise

  // actions
  get: MagnetarGetAction<DocDataType, 'collection'>
  stream: MagnetarStreamAction
  insert: MagnetarInsertAction<DocDataType>

  // filters
  where: (fieldPath: string, operator: WhereFilterOp, value: any) => CollectionInstance<DocDataType>
  orderBy: (fieldPath: string, direction?: 'asc' | 'desc') => CollectionInstance<DocDataType>
  limit: (limitCount: number) => CollectionInstance<DocDataType>
}

export function createCollectionWithContext<DocDataType extends Record<string, any>>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn<DocDataType>,
  streams: {
    openStreams: OpenStreams
    findStream: FindStream
    openStreamPromises: OpenStreamPromises
    findStreamPromise: FindStreamPromise
  }
): CollectionInstance<DocDataType> {
  const { openStreams, findStream, openStreamPromises, findStreamPromise } = streams
  const id = collectionPath.split('/').slice(-1)[0]
  const path = collectionPath

  const doc: DocFn<DocDataType> = (docId: string, _moduleConfig: ModuleConfig = {}) => {
    return docFn(`${path}/${docId}`, _moduleConfig)
  }

  const insert = handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.get, docFn, collectionFn) as MagnetarInsertAction<DocDataType> //prettier-ignore
  const get = handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn) as MagnetarGetAction<DocDataType, 'collection'> //prettier-ignore
  const stream = handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streams) // prettier-ignore

  const actions = { stream, get, insert }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  function where(
    fieldPath: string,
    operator: WhereFilterOp,
    value: any
  ): CollectionInstance<DocDataType> {
    const whereClause: WhereClause = [fieldPath, operator, value]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { where: [whereClause] })
    return collectionFn(path, moduleConfigWithClause)
  }

  function orderBy(
    fieldPath: string,
    direction: 'asc' | 'desc' = 'asc'
  ): CollectionInstance<DocDataType> {
    const orderByClause: OrderByClause = [fieldPath, direction]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { orderBy: [orderByClause] })
    return collectionFn(path, moduleConfigWithClause)
  }

  function limit(limitCount: number): CollectionInstance<DocDataType> {
    return collectionFn(path, { ...moduleConfig, limit: limitCount })
  }

  const queryFns = { where, orderBy, limit }

  const moduleInstance: Omit<CollectionInstance<DocDataType>, 'data'> = {
    doc,
    id,
    path,
    openStreams,
    findStream,
    openStreamPromises,
    findStreamPromise,
    ...actions,
    ...queryFns,
  }

  /**
   * The data returned by the store specified as 'dataStoreName'
   */
  const dataProxyHandler = getDataProxyHandler<'collection', DocDataType>(
    [collectionPath, docId],
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
