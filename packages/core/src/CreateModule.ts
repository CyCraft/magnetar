import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  ActionName,
  ActionType,
  VueSyncWriteAction,
  VueSyncGetAction,
  isWriteAction,
  VueSyncStreamAction,
} from './types/actions'
import { SharedConfig, PlainObject } from './types/base'
import { VueSyncConfig } from '.'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'

export type VueSyncModuleInstance = {
  data: {
    [storeName: string]: PlainObject
  }
  get?: VueSyncGetAction
  stream?: VueSyncStreamAction
  insert?: VueSyncWriteAction
  merge?: VueSyncWriteAction
  assign?: VueSyncWriteAction
  replace?: VueSyncWriteAction
  delete?: VueSyncWriteAction
}

// this is what the dev passes when creating a module
export type ModuleConfig = O.Merge<
  Partial<SharedConfig>,
  {
    // custom config per store plugin
    configPerStore?: {
      [storeName: string]: PlainObject
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
        carry[actionName] = handleActionPerStore(moduleConfig, globalConfig, actionName, actionType)
      }
      if (actionName === 'get') {
        carry[actionName] = handleActionPerStore(moduleConfig, globalConfig, actionName, actionType)
      }
      if (actionName === 'stream') {
        carry[actionName] = handleStreamPerStore(moduleConfig, globalConfig, actionType)
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
    const pluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
    const setModuleDataReference = globalConfig.stores[storeName].setModuleDataReference
    data[storeName] = setModuleDataReference(pluginModuleConfig, previousStoreData)
  }

  return {
    data,
    ...actions,
  }
}
