import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  VueSyncWriteAction,
  VueSyncGetAction,
  VueSyncStreamAction,
  VueSyncDeleteAction,
} from './types/actions'
import { SharedConfig, PlainObject } from './types/base'
import { VueSyncConfig } from '.'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { throwIfNoDataStoreName } from './helpers/throwFns'

export type VueSyncModuleInstance = {
  data: { [idOrProp: string]: any }
  openStreams: { [identifier: string]: () => void }
  get?: VueSyncGetAction
  stream?: VueSyncStreamAction
  insert?: VueSyncWriteAction
  merge?: VueSyncWriteAction
  assign?: VueSyncWriteAction
  replace?: VueSyncWriteAction
  delete?: VueSyncDeleteAction
}

// this is what the dev passes when creating a module
export type ModuleConfig = O.Merge<
  Partial<SharedConfig>,
  {
    /**
     * custom config per store plugin
     */
    configPerStore?: {
      [storeName: string]: PlainObject
    }
  }
>

export function CreateModuleWithContext (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>
): VueSyncModuleInstance {
  const openStreams: { [identifier: string]: () => void } = {}

  const actions = {
    insert: handleActionPerStore(moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert),
    merge: handleActionPerStore(moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge),
    assign: handleActionPerStore(moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign),
    replace: handleActionPerStore(moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace),
    delete: handleActionPerStore(moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete),
    get: handleActionPerStore(moduleConfig, globalConfig, 'get', actionNameTypeMap.get),
    stream: handleStreamPerStore(moduleConfig, globalConfig, actionNameTypeMap.stream, openStreams),
  }

  // each store in write order will get the chance to initialise data
  const dataStoreName = moduleConfig.dataStoreName || globalConfig.dataStoreName
  throwIfNoDataStoreName(dataStoreName)
  const pluginModuleConfig = moduleConfig?.configPerStore[dataStoreName] || {}
  const { setModuleDataReference } = globalConfig.stores[dataStoreName]
  const data = setModuleDataReference(pluginModuleConfig)

  return {
    data,
    openStreams,
    ...actions,
  }
}
