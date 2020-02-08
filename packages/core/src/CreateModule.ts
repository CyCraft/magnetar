import { plainObject, actionTypeMap } from './types'
import { VueSyncConfig } from '.'
import { handleAction } from './moduleActions/handleAction'

type eventName = 'before' | 'success' | 'error'

type eventFn = (args: { payload: plainObject; abort: () => void; error?: any }) => void

type EventsPerStore = {
  [storeName: string]: {
    [key in eventName]?: eventFn
  } & {
    aborted?: (args: { at: eventName; storeName: string; payload: plainObject }) => void
  }
}

interface ActionConfig {
  on?: EventsPerStore
}

export interface VueSyncModuleInstance {
  insert: (payload: plainObject, actionConfig: ActionConfig) => void
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
  return {
    insert: async (payload: plainObject, actionConfig: ActionConfig = {}): Promise<void> => {
      const { on } = actionConfig
      const storesToExecute =
        vueSyncConfig.executionOrder.insert ||
        vueSyncConfig.executionOrder[actionTypeMap.insert] ||
        []
      return storesToExecute.reduce((_payload, storeName) => {
        const pluginAction = vueSyncConfig.stores[storeName].actions.insert
        if (!pluginAction) return _payload
        handleAction({
          pluginAction,
          payload,
          on,
          storeName,
        })
      }, payload)
    },
  }
}
