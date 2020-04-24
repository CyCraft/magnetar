import { O } from 'ts-toolbelt'
import {
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncInsertAction,
  OpenStreams,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { DocFn, CollectionFn } from './VueSync'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'
import { WhereClause, WhereFilterOp, OrderBy } from './types/clauses'
import { mergeAndConcat } from 'merge-anything'

export type CollectionInstance<DocDataType extends object = { [prop: string]: any }> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  /**
   * A WeakMap of all open streams with the payload passed to `stream(payload)` as key and the `unsubscribe` function as value. In case `stream()` had no payload, use `{}`
   * @type { WeakMap<object, () => void> }
   * @example
   * collection('myDocs').stream()
   * const unsubscribe = collection('myDocs').openStreams.get({})
   */
  openStreams: OpenStreams

  // actions
  get?: VueSyncGetAction<DocDataType, 'collection'>
  stream?: VueSyncStreamAction
  insert?: VueSyncInsertAction<DocDataType>

  // filters
  where: (fieldPath: string, operator: WhereFilterOp, value: any) => CollectionInstance<DocDataType>
  orderBy: (fieldPath: string, direction?: 'asc' | 'desc') => CollectionInstance<DocDataType>
  limit: (limitCount: number) => CollectionInstance<DocDataType>
}

export function createCollectionWithContext<DocDataType extends object> (
  idOrPath: string,
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn<DocDataType>,
  openStreams: OpenStreams
): CollectionInstance<DocDataType> {
  const id = idOrPath.split('/').slice(-1)[0]
  const path = idOrPath

  const doc: DocFn<DocDataType> = (idOrPath: string, _moduleConfig: ModuleConfig = {}) => {
    return docFn(`${path}/${idOrPath}`, _moduleConfig)
  }

  const insert = handleActionPerStore(path, moduleConfig, globalConfig, 'insert', actionNameTypeMap.get, docFn, collectionFn) as VueSyncInsertAction<DocDataType> //prettier-ignore
  const get = handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn) as VueSyncGetAction<DocDataType, 'collection'> //prettier-ignore
  const stream = handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore

  const actions = { stream, get, insert }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, path, moduleConfig)

  function where (
    fieldPath: string,
    operator: WhereFilterOp,
    value: any
  ): CollectionInstance<DocDataType> {
    const whereClause: WhereClause = [fieldPath, operator, value]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { where: [whereClause] })
    return collectionFn(idOrPath, moduleConfigWithClause)
  }

  function orderBy (
    fieldPath: string,
    direction: 'asc' | 'desc' = 'asc'
  ): CollectionInstance<DocDataType> {
    const orderBy: OrderBy = [fieldPath, direction]
    const moduleConfigWithClause = mergeAndConcat(moduleConfig, { orderBy: [orderBy] })
    return collectionFn(idOrPath, moduleConfigWithClause)
  }

  function limit (limitCount: number): CollectionInstance<DocDataType> {
    return collectionFn(idOrPath, { ...moduleConfig, limit: limitCount })
  }

  const queryFns = { where, orderBy, limit }

  const moduleInstance: Omit<CollectionInstance<DocDataType>, 'data'> = {
    doc,
    id,
    path,
    openStreams,
    ...actions,
    ...queryFns,
  }

  /**
   * The data returned by the store specified as 'dataStoreName'
   */
  const dataProxyHandler = getDataProxyHandler<'collection', DocDataType>(
    path,
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
