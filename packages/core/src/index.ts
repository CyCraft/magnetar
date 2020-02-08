import { plainObject, Actions } from './types'
import { CreateModuleWithContext, ModuleConfig } from './CreateModule'

type storeName = string

export interface VueSyncConfig {
  stores: {
    [storeName: string]: {
      actions: { [action in Actions]?: (payload: plainObject) => Promise<any> }
      config: { [key: string]: any } // any other config the plugin needs
    }
  }
  executionOrder: {
    reads: storeName[]
    writes: storeName[]
  } & {
    [action in Actions]?: storeName[]
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
