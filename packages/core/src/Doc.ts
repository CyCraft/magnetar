import { O } from 'ts-toolbelt'
import {
  VueSyncWriteAction,
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncDeleteAction,
  VueSyncDeletePropAction,
  VueSyncInsertAction,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { throwIfInvalidId } from './helpers/throwFns'
import { ModuleConfig, GlobalConfig } from './types/config'
import { CollectionFn, DocFn } from './VueSync'
import { CollectionInstance } from './Collection'
import { executeSetupModulePerStore, getDataFromDataStore } from './helpers/moduleHelpers'

export type DocInstance<DocDataType = { [prop: string]: any }> = {
  data: DocDataType
  collection: CollectionFn
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }

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

export function createDocWithContext<DocDataType> (
  idOrPath: string,
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn<DocDataType>
): DocInstance<DocDataType> {
  throwIfInvalidId(idOrPath, 'doc')

  const id = idOrPath.split('/').slice(-1)[0]
  const path = idOrPath
  const openStreams: { [identifier: string]: () => void } = {}

  function collection<DocDataType> (
    idOrPath: string,
    _moduleConfig: ModuleConfig = {}
  ): CollectionInstance<DocDataType> {
    return collectionFn<DocDataType>(`${path}/${idOrPath}`, _moduleConfig)
  }

  const actions = {
    insert: (handleActionPerStore(path, moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert,  docFn) as VueSyncInsertAction<DocDataType>), // prettier-ignore
    merge: (handleActionPerStore(path, moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, docFn) as VueSyncWriteAction<DocDataType>), // prettier-ignore
    assign: (handleActionPerStore(path, moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, docFn) as VueSyncWriteAction<DocDataType>), // prettier-ignore
    replace: (handleActionPerStore(path, moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, docFn) as VueSyncWriteAction<DocDataType>), // prettier-ignore
    deleteProp: (handleActionPerStore(path, moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, docFn) as VueSyncDeletePropAction<DocDataType>), // prettier-ignore
    delete: (handleActionPerStore(path, moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete, docFn) as VueSyncDeleteAction<DocDataType>), // prettier-ignore
    get: (handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn) as VueSyncGetAction<DocDataType, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore(
      path,
      moduleConfig,
      globalConfig,
      actionNameTypeMap.stream,
      openStreams
    ),
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, path, moduleConfig)

  // The store specified as 'dataStoreName' should return data
  const getModuleData = getDataFromDataStore<'doc', DocDataType>(path, moduleConfig, globalConfig)

  const dataHandler = {
    get: function (target, key, proxyRef): any {
      if (key === 'data') return getModuleData<DocDataType>(path)
      return Reflect.get(target, key, proxyRef)
    },
  }

  const moduleInstance = {
    collection,
    id,
    path,
    openStreams,
    ...actions,
  }
  const moduleInstanceWithDataProxy = new Proxy(
    moduleInstance,
    dataHandler
  ) as typeof moduleInstance & { data: DocDataType }

  return moduleInstanceWithDataProxy
}
