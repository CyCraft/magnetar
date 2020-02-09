import { ActionName, PluginAction, ActionType } from './types/actions'
import { CreateModuleWithContext, ModuleConfig } from './CreateModule'

type StoreName = string

export interface VueSyncConfig {
  stores: {
    [storeName: string]: {
      actions: { [action in ActionName]?: PluginAction }
      config: { [key: string]: any } // any other config the plugin needs
    }
  }
  executionOrder: {
    [actionType in ActionType]?: StoreName[]
  } &
    {
      [action in ActionName]?: StoreName[]
    }
}

export interface VueSyncInstance {
  config: VueSyncConfig
  createModule: (moduleConfig: ModuleConfig) => ReturnType<typeof CreateModuleWithContext>
}

export function VueSync (vueSyncConfig: VueSyncConfig): VueSyncInstance {
  const config = vueSyncConfig
  const createModule = (moduleConfig: ModuleConfig): ReturnType<typeof CreateModuleWithContext> =>
    CreateModuleWithContext(moduleConfig, vueSyncConfig)
  return {
    config,
    createModule,
  }
}
