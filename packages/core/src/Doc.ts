import { O } from 'ts-toolbelt'
import {
  VueSyncWriteAction,
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncDeleteAction,
  VueSyncDeletePropAction,
  VueSyncInsertAction,
  OpenStreams,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { CollectionFn, DocFn } from './VueSync'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'

export type DocInstance<DocDataType extends object = { [prop: string]: any }> = {
  data: DocDataType
  collection: CollectionFn
  id: string
  path: string
  openStreams: OpenStreams

  // actions
  get?: VueSyncGetAction<DocDataType, 'doc'>
  stream?: VueSyncStreamAction
  insert?: VueSyncInsertAction<DocDataType>
  merge?: VueSyncWriteAction<DocDataType>
  assign?: VueSyncWriteAction<DocDataType>
  replace?: VueSyncWriteAction<DocDataType>
  deleteProp?: VueSyncDeletePropAction<DocDataType>
  delete?: VueSyncDeleteAction<DocDataType>
}

export function createDocWithContext<DocDataType extends object> (
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn,
  openStreams: OpenStreams
): DocInstance<DocDataType> {
  const id = docId
  const path = [collectionPath, docId].join('/')

  const collection: CollectionFn = (collectionId, _moduleConfig = {}) => {
    return collectionFn(`${path}/${collectionId}`, _moduleConfig)
  }

  const actions = {
    insert: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert,  docFn) as VueSyncInsertAction<DocDataType>), // prettier-ignore
    merge: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, docFn) as VueSyncWriteAction<DocDataType>), // prettier-ignore
    assign: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, docFn) as VueSyncWriteAction<DocDataType>), // prettier-ignore
    replace: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, docFn) as VueSyncWriteAction<DocDataType>), // prettier-ignore
    deleteProp: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, docFn) as VueSyncDeletePropAction<DocDataType>), // prettier-ignore
    delete: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete, docFn) as VueSyncDeleteAction<DocDataType>), // prettier-ignore
    get: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn) as VueSyncGetAction<DocDataType, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore(
      [collectionPath, docId],
      moduleConfig,
      globalConfig,
      actionNameTypeMap.stream,
      openStreams
    ),
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  const moduleInstance: Omit<DocInstance<DocDataType>, 'data'> = {
    collection,
    id,
    path,
    openStreams,
    ...actions,
  }

  /**
   * The data returned by the store specified as 'dataStoreName'
   */
  const dataProxyHandler = getDataProxyHandler<'doc', DocDataType>(
    [collectionPath, docId],
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
