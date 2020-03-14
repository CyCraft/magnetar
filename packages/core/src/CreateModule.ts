import { O } from 'ts-toolbelt'
import {
  actionNameTypeMap,
  ActionName,
  ActionType,
  VueSyncWriteAction,
  VueSyncGetAction,
  isWriteAction,
} from './types/actions'
import { SharedConfig } from './types/base'
import { VueSyncConfig } from '.'
import { createWriteHandler } from './moduleActions/createWriteHandler'
import { createGetHandler } from './moduleActions/createGetHandler'

export type VueSyncModuleInstance = {
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

  return {
    ...actions,
  }
}
