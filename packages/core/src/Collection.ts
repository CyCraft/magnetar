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
import { DocFn } from '.'
import { DocInstance } from './Doc'

export type CollectionInstance<DocDataType = { [prop: string]: any }> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  openStreams: { [identifier: string]: () => void }
  get?: VueSyncGetAction
  stream?: VueSyncStreamAction
  insert?: VueSyncInsertAction<DocDataType>
}

export function createCollectionWithContext<DocDataType> (
  idOrPath: string,
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>
): CollectionInstance<DocDataType> {
  throwIfInvalidId(idOrPath, 'collection')

  const id = idOrPath.split('/').slice(-1)[0]
  const path = idOrPath
  const openStreams: { [identifier: string]: () => void } = {}

  const doc: DocFn<DocDataType> = (idOrPath: string, _moduleConfig: ModuleConfig = {}) => {
    return docFn(`${path}/${idOrPath}`, _moduleConfig)
  }

  async function insert (
    payload: object,
    actionConfig: ActionConfig = {}
  ): Promise<DocInstance<DocDataType>> {
    const handleWriteActionPerStore = handleActionPerStore(
      path,
      moduleConfig,
      globalConfig,
      'insert',
      actionNameTypeMap.insert
    )
    const newId = ((await handleWriteActionPerStore(payload, actionConfig)) as unknown) as string
    return doc(newId)
  }

  const actions = {
    insert,
    get: handleActionPerStore(path, moduleConfig, globalConfig, 'get', actionNameTypeMap.get), // prettier-ignore
    stream: handleStreamPerStore(path, moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams) // prettier-ignore
  }

  // The store specified as 'dataStoreName' should return data
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const { returnCollectionData } = globalConfig.stores[dataStoreName]
  const moduleConfigPerStore = moduleConfig?.configPerStore || {}
  const pluginModuleConfig = moduleConfigPerStore[dataStoreName] || {}
  const data = returnCollectionData<DocDataType>(path, pluginModuleConfig)

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
