import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncInsertAction,
  ActionConfig,
} from './types/actions'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { throwIfNoDataStoreName, throwIfInvalidId } from './helpers/throwFns'
import { ModuleConfig, GlobalConfig } from './types/base'
import { DocFn, CollectionFn } from '.'
import { DocInstance } from './Doc'
import { executeSetupModulePerStore } from './helpers/moduleHelpers'

export type CollectionInstance<DocDataType = { [prop: string]: any }> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }
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

  // function collection<DocDataType> (
  //   idOrPath: string,
  //   moduleConfig: ModuleConfig = {}
  // ): CollectionInstance<DocDataType>

  // we need to wrap insert so we can return the wrapped new doc for the inserted item!
  async function insert (
    payload: object,
    actionConfig: ActionConfig = {}
  ): Promise<DocInstance<DocDataType>> {
    const handleWriteActionPerStore = handleActionPerStore(
      path,
      moduleConfig,
      globalConfig,
      'insert',
      actionNameTypeMap.insert,
      docFn,
      collectionFn
    )
    const newId = ((await handleWriteActionPerStore(payload, actionConfig)) as unknown) as string
    return doc(newId)
  }

  const actions = {
    insert,
    get: handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get, docFn, collectionFn), // prettier-ignore
    stream: handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, path, moduleConfig)

  // The store specified as 'dataStoreName' should return data
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const { getModuleData } = globalConfig.stores[dataStoreName]
  const storeModuleConfig = moduleConfig?.configPerStore?.[dataStoreName] || {}
  const data = getModuleData<DocDataType>(path, storeModuleConfig)

  const moduleInstance = {
    doc,
    data,
    id,
    path,
    openStreams,
    ...actions,
  }
  // titian, how should I fix conditional return type in the cleanest way?
  return moduleInstance
}
