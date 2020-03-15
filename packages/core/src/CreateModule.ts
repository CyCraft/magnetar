import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  ActionName,
  ActionType,
  VueSyncWriteAction,
  VueSyncGetAction,
  isWriteAction,
} from './types/actions'
import { SharedConfig, PlainObject } from './types/base'
import { VueSyncConfig } from '.'
import { createWriteHandler } from './moduleActions/createWriteHandler'
import { createGetHandler } from './moduleActions/createGetHandler'

export type VueSyncModuleInstance = {
  data: {
    [storeName: string]: PlainObject
  }
  get?: VueSyncGetAction
  stream?: VueSyncGetAction
  insert?: VueSyncWriteAction
  merge?: VueSyncWriteAction
  assign?: VueSyncWriteAction
  replace?: VueSyncWriteAction
  delete?: VueSyncWriteAction
}

export type ModuleType = 'collection' | 'document'

// this is what the dev passes when creating a module
export type ModuleConfig = O.Merge<
  Partial<SharedConfig>,
  {
    type: ModuleType
    configPerStore?: {
      [storeName: string]: {
        [key: string]: any // whatever the dev passed for this plugin when creating a Vue Sync Module instance (`VueSyncPluginModuleConfig`)
      }
    }
  }
>

export function CreateModuleWithContext (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>
): VueSyncModuleInstance {
  const actions = Object.entries(actionNameTypeMap).reduce(
    (carry, [actionName, actionType]: [ActionName, ActionType]) => {
      if (isWriteAction(actionName)) {
        carry[actionName] = createWriteHandler(moduleConfig, globalConfig, actionName, actionType)
      }
      if (actionName === 'get') {
        carry[actionName] = createGetHandler(moduleConfig, globalConfig)
      }
      return carry
    },
    {} as VueSyncModuleInstance
  )

  // each store in write order will get the chance to initialise data
  const data: { [storeName: string]: PlainObject } = {}
  const storesToInitialise =
    globalConfig.executionOrder?.write ||
    globalConfig.executionOrder?.insert ||
    Object.keys(globalConfig.stores)
  for (const [i, storeName] of storesToInitialise.entries()) {
    const previousStoreName = storesToInitialise[i - 1]
    const previousStoreData = data[previousStoreName] || {}
    // save a reference to the dataReference of each the store plugin
    const pluginModuleConfig = moduleConfig?.configPerStore[storeName]
    const setModuleDataReference = globalConfig.stores[storeName].setModuleDataReference
    data[storeName] = setModuleDataReference(pluginModuleConfig, previousStoreData)
  }

  return {
    data,
    ...actions,
  }
}
