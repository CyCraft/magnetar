import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncInsertAction,
} from './types/actions'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { throwIfInvalidId } from './helpers/throwFns'
import { ModuleConfig, GlobalConfig } from './types/base'
import { DocFn, CollectionFn } from '.'
import { executeSetupModulePerStore, getDataFromDataStore } from './helpers/moduleHelpers'

export type CollectionInstance<DocDataType = { [prop: string]: any }> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }

  // actions
  get?: VueSyncGetAction<DocDataType, 'collection'>
  stream?: VueSyncStreamAction
  insert?: VueSyncInsertAction<DocDataType>
}

export function createCollectionWithContext<DocDataType> (
  idOrPath: string,
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn<DocDataType>
): CollectionInstance<DocDataType> {
  throwIfInvalidId(idOrPath, 'collection')

  const id = idOrPath.split('/').slice(-1)[0]
  const path = idOrPath
  const openStreams: { [identifier: string]: () => void } = {}

  const doc: DocFn<DocDataType> = (idOrPath: string, _moduleConfig: ModuleConfig = {}) => {
    return docFn(`${path}/${idOrPath}`, _moduleConfig)
  }

  const insert = handleActionPerStore(path, moduleConfig, globalConfig, 'insert', actionNameTypeMap.get, docFn, collectionFn) as VueSyncInsertAction<DocDataType> //prettier-ignore
  const get = handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn) as VueSyncGetAction<DocDataType, 'collection'> //prettier-ignore

  const actions = {
    insert,
    get,
    stream: handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, path, moduleConfig)

  // The store specified as 'dataStoreName' should return data
  const data = getDataFromDataStore<'collection', DocDataType>(path, moduleConfig, globalConfig)

  const moduleInstance = {
    doc,
    data,
    id,
    path,
    openStreams,
    ...actions,
  }
  return moduleInstance
}
