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
  openStreams: { [identifier: string]: () => void }
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
  const openStreams: { [identifier: string]: () => void } = {}

  const actions = Object.entries(actionNameTypeMap).reduce(
    (carry, [actionName, actionType]: [ActionName, ActionType]) => {
      if (isWriteAction(actionName)) {
        carry[actionName] = handleActionPerStore(moduleConfig, globalConfig, actionName, actionType)
      }
      if (actionName === 'get') {
        carry[actionName] = handleActionPerStore(moduleConfig, globalConfig, actionName, actionType)
      }
      if (actionName === 'stream') {
        carry[actionName] = handleStreamPerStore(
          moduleConfig,
          globalConfig,
          actionType,
          openStreams
        )
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
  for (const storeName of storesToInitialise) {
    // save a reference to the dataReference of each the store plugin
    const pluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
    const { setModuleDataReference } = globalConfig.stores[storeName]
    data[storeName] = setModuleDataReference(pluginModuleConfig)
  }

  return {
    data,
    openStreams,
    ...actions,
  }
}
