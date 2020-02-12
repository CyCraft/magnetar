import { merge } from 'merge-anything'
import { actionNameTypeMap, ActionName, PluginAction, ActionConfig } from './types/actions'
import { handleAction } from './moduleActions/handleAction'
import { Config, plainObject } from './types/base'
import { VueSyncConfig } from '.'

export type VueSyncModuleInstance = {
  [action in ActionName]?: PluginAction // prettier-ignore
}

export type ModuleConfig = {
  type: 'collection' | 'document'
  storeConfig?: {
    [storeName: string]: {
      path: string
    }
  }
} & Partial<Config>

export function CreateModuleWithContext (
  moduleConfig: ModuleConfig,
  globalConfig: Required<VueSyncConfig>
): VueSyncModuleInstance {
  const insert: PluginAction = async <T extends plainObject>(
    payload: T,
    actionConfig: ActionConfig = {}
  ) => {
    // get config for action
    const config = merge(globalConfig, moduleConfig, actionConfig)
    const storesToExecute =
      config.executionOrder.insert || config.executionOrder[actionNameTypeMap.insert] || []
    if (storesToExecute.length === 0) {
      throw new Error('None of your store plugins have implemented this function.')
    }
    // create abort mechanism for the entire store chain, to be triggered inside handleAction
    let stopExecution = false
    function stopExecutionAfterAction (): void {
      stopExecution = true
    }
    // handle and await each action in sequence
    let result: Partial<T> = payload
    for (const storeName of storesToExecute) {
      if (stopExecution) return result
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName].actions.insert
      // the plugin action
      result = !pluginAction
        ? result
        : await handleAction({
            pluginAction,
            payload: result,
            config,
            storeName,
            stopExecutionAfterAction,
          })
    }
    return result
  }
  return {
    insert,
  }
}
