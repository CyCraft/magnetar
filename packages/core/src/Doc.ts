import { O } from 'ts-toolbelt'
import {
  MagnetarWriteAction,
  MagnetarFetchAction,
  MagnetarStreamAction,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
  FetchPromises,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import {
  handleActionPerStore,
  HandleActionSharedParams,
} from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { CollectionFn, DocFn, WriteLock } from './Magnetar'
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
   * Returns the open stream promise of this doc.
   *
   * Returns `null` when there is no open stream.
   *
   * This promise will resolve when `doc().closeStream()` is called, or when the stream closed because of an error.
   */
  streaming: () => Promise<void> | null
  /**
   * Close the stream of this doc.
   *
   * Does nothing if there is no open stream.
   */
  closeStream: () => void

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
    writeLock: WriteLock
    fetchPromises: FetchPromises
    cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void
    streaming: () => Promise<void> | null
    closeStream: () => void
  }
): DocInstance<DocDataType> {
  const { writeLock, fetchPromises, cacheStream, streaming, closeStream } = streamAndFetchPromises // prettier-ignore

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
    writeLock,
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
    stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streaming, cacheStream, writeLock), // prettier-ignore
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
