import { O } from 'ts-toolbelt'
import {
  MagnetarWriteAction,
  MagnetarFetchAction,
  MagnetarStreamAction,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
  OpenStreams,
  FindStream,
  OpenStreamPromises,
  FindStreamPromise,
  FetchPromises,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { CollectionFn, DocFn } from './Magnetar'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'

export type DocInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
  /**
   * The cached data that was written or read so far
   */
  data: DocDataType | undefined
  /**
   * `collection` is available on every document for chaining
   * @example doc('001').collection('items')
   */
  collection: CollectionFn
  /**
   * The id of the document. When this is a nested document, it will not include the full path, only the final part
   * @example '001'
   */
  id: string
  /**
   * The full path of the document
   * @example 'pokedex/001'
   */
  path: string
  /**
   * @see {@link OpenStreams}
   */
  openStreams: OpenStreams
  /**
   * @see {@link FindStream}
   */
  findStream: FindStream
  /**
   * @see {@link OpenStreamPromises}
   */
  openStreamPromises: OpenStreamPromises
  /**
   * @see {@link FindStreamPromise}
   */
  findStreamPromise: FindStreamPromise

  // actions
  /**
   * @see {@link MagnetarFetchAction}
   */
  fetch: MagnetarFetchAction<DocDataType, 'doc'>
  /**
   * @see {@link MagnetarStreamAction}
   */
  stream: MagnetarStreamAction
  /**
   * @see {@link MagnetarInsertAction}
   */
  insert: MagnetarInsertAction<DocDataType>
  /**
   * @see {@link MagnetarWriteAction}
   */
  merge: MagnetarWriteAction<DocDataType>
  /**
   * @see {@link MagnetarWriteAction}
   */
  assign: MagnetarWriteAction<DocDataType>
  /**
   * @see {@link MagnetarWriteAction}
   */
  replace: MagnetarWriteAction<DocDataType>
  /**
   * @see {@link MagnetarDeletePropAction}
   */
  deleteProp: MagnetarDeletePropAction<DocDataType>
  /**
   * @see {@link MagnetarDeleteAction}
   */
  delete: MagnetarDeleteAction
}

export function createDocWithContext<DocDataType extends Record<string, any>>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn,
  streamAndFetchPromises: {
    openStreams: OpenStreams
    findStream: FindStream
    openStreamPromises: OpenStreamPromises
    findStreamPromise: FindStreamPromise
    fetchPromises: FetchPromises
  }
): DocInstance<DocDataType> {
  const { openStreams, findStream, openStreamPromises, findStreamPromise, fetchPromises } = streamAndFetchPromises // prettier-ignore
  const streamPromiseInfo = { openStreams, findStream, openStreamPromises, findStreamPromise }
  const id = docId
  const path = [collectionPath, docId].join('/')

  const collection: CollectionFn = (collectionId, _moduleConfig = {}) => {
    return collectionFn(`${path}/${collectionId}`, _moduleConfig)
  }

  const actions = {
    insert: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert, fetchPromises, docFn) as MagnetarInsertAction<DocDataType>), // prettier-ignore
    merge: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, fetchPromises, docFn) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    assign: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, fetchPromises, docFn) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    replace: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, fetchPromises, docFn) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    deleteProp: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, fetchPromises, docFn) as MagnetarDeletePropAction<DocDataType>), // prettier-ignore
    delete: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete, fetchPromises, docFn) as MagnetarDeleteAction), // prettier-ignore
    fetch: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'fetch', actionNameTypeMap.fetch, fetchPromises, docFn) as MagnetarFetchAction<DocDataType, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streamPromiseInfo), // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  const moduleInstance: Omit<DocInstance<DocDataType>, 'data'> = {
    collection,
    id: id as string,
    path,
    openStreams,
    findStream,
    openStreamPromises,
    findStreamPromise,
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
