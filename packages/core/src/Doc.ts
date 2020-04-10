import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  VueSyncWriteAction,
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncDeleteAction,
  VueSyncDeletePropAction,
} from './types/actions'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { throwIfNoDataStoreName, throwIfInvalidId } from './helpers/throwFns'
import { ModuleConfig, GlobalConfig } from './types/base'
import { CollectionFn, DocFn } from '.'
import { CollectionInstance } from './Collection'
import { executeSetupModulePerStore } from './helpers/moduleHelpers'

export type DocInstance<DocDataType = { [prop: string]: any }> = {
  data: DocDataType
  collection: CollectionFn
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }
  get?: VueSyncGetAction<DocDataType, 'doc'>
  stream?: VueSyncStreamAction
  insert?: VueSyncWriteAction
  merge?: VueSyncWriteAction
  assign?: VueSyncWriteAction
  replace?: VueSyncWriteAction
  deleteProp?: VueSyncDeletePropAction
  delete?: VueSyncDeleteAction
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
    insert: handleActionPerStore(path, moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert,  docFn), // prettier-ignore
    merge: handleActionPerStore(path, moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, docFn), // prettier-ignore
    assign: handleActionPerStore(path, moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, docFn), // prettier-ignore
    replace: handleActionPerStore(path, moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, docFn), // prettier-ignore
    deleteProp: handleActionPerStore(path, moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, docFn), // prettier-ignore
    delete: handleActionPerStore(path, moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete, docFn), // prettier-ignore
    get: handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn), // prettier-ignore
    stream: handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, path, moduleConfig)

  // The store specified as 'dataStoreName' should return data
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const { getModuleData } = globalConfig.stores[dataStoreName]
  const storeModuleConfig = moduleConfig?.configPerStore?.[dataStoreName] || {}

  const dataHandler = {
    get: function (target, key, proxyRef) {
      if (key === 'data') return getModuleData<DocDataType>(path, storeModuleConfig)
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
