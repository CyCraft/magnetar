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
import { CollectionFn } from '.'
import { CollectionInstance } from './Collection'

export type DocInstance<DocDataType = { [prop: string]: any }> = {
  data: DocDataType
  collection: CollectionFn
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }
  get?: VueSyncGetAction
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
  collectionFn: CollectionFn
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
    insert: handleActionPerStore(path, moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert), // prettier-ignore
    merge: handleActionPerStore(path, moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge), // prettier-ignore
    assign: handleActionPerStore(path, moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign), // prettier-ignore
    replace: handleActionPerStore(path, moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace), // prettier-ignore
    deleteProp: handleActionPerStore(path, moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp), // prettier-ignore
    delete: handleActionPerStore(path, moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete), // prettier-ignore
    get: handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get), // prettier-ignore
    stream: handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore
  }

  // The store specified as 'dataStoreName' should return data
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const { returnDocData } = globalConfig.stores[dataStoreName]
  const moduleConfigPerStore = moduleConfig?.configPerStore || {}
  const pluginModuleConfig = moduleConfigPerStore[dataStoreName] || {}
  const data = returnDocData<DocDataType>(path, pluginModuleConfig)

  const moduleInstance = {
    collection,
    data,
    id,
    path,
    openStreams,
    ...actions,
  }
  return moduleInstance
}
