import { O } from 'ts-toolbelt'
import { VueSyncGetAction, VueSyncStreamAction, VueSyncInsertAction } from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { throwIfInvalidId } from './helpers/throwFns'
import { ModuleConfig, GlobalConfig } from './types/config'
import { DocFn, CollectionFn } from './VueSync'
import { executeSetupModulePerStore, getDataFromDataStore } from './helpers/moduleHelpers'

export type CollectionInstance<DocDataType extends object = { [prop: string]: any }> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }

  // actions
  get?: VueSyncGetAction<DocDataType, 'collection'>
  stream?: VueSyncStreamAction
  insert?: VueSyncInsertAction<DocDataType>

  // filters
  where: (...args: any[]) => CollectionInstance<DocDataType>
}

export function createCollectionWithContext<DocDataType extends object> (
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
  const stream = handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore

  const actions = { stream, get, insert }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, path, moduleConfig)

  // The store specified as 'dataStoreName' should return data
  const data = getDataFromDataStore<'collection', DocDataType>(path, moduleConfig, globalConfig)

  const moduleInstancePartial: Partial<CollectionInstance<DocDataType>> = {
    doc,
    data,
    id,
    path,
    openStreams,
    ...actions,
  }

  // @ts-ignore
  const where: CollectionInstance<DocDataType> = (...args: any[]) => {
    const clauses = { where: [args] }
    const get = handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn, clauses) as VueSyncGetAction<DocDataType, 'collection'> //prettier-ignore
    return {
      ...moduleInstancePartial,
      get,
    }
  }

  // @ts-ignore
  const moduleInstance: CollectionInstance<DocDataType> = { ...moduleInstancePartial, where }

  return moduleInstance
}
