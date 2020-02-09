import {
  actionNameTypeMap,
  ActionName,
  PluginAction,
  plainObject,
  ActionConfig,
} from './types/actions'
import { VueSyncConfig } from '.'
import { handleAction } from './moduleActions/handleAction'

export type VueSyncModuleInstance = {
  [action in ActionName]?: PluginAction // prettier-ignore
}

export interface ModuleConfig {
  type: 'collection' | 'document'
  storeConfig?: {
    [storeName: string]: { path: string }
  }
}

export function CreateModuleWithContext (
  moduleConfig: ModuleConfig,
  vueSyncConfig: VueSyncConfig
): VueSyncModuleInstance {
  const insert: PluginAction = async <T extends plainObject>(
    payload: T,
    actionConfig: ActionConfig = {}
  ) => {
    const storesToExecute =
      vueSyncConfig.executionOrder.insert ||
      vueSyncConfig.executionOrder[actionNameTypeMap.insert] ||
      []
    if (storesToExecute.length === 0) {
      throw new Error('None of your store plugins have implemented this function.')
    }
    // create abort mechanism for the entire store chain
    let abortExecution = false
    function wasAborted (): void {
      abortExecution = true
    }
    // handle and await each action in sequence
    let result: Partial<T> = payload
    for (const storeName of storesToExecute) {
      // find the action on the plugin
      const pluginAction = vueSyncConfig.stores[storeName].actions.insert
      // the plugin action
      result = !pluginAction
        ? result
        : await handleAction({
            pluginAction,
            payload,
            actionConfig,
            storeName,
            wasAborted,
          })
      if (abortExecution) return result
    }
    return result
  }
  return {
    insert,
  }
}
