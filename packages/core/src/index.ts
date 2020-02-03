import { plainObject } from './types'
import { CreateModuleWithContext, ModuleConfig } from './CreateModule'

export interface VueSyncConfig {
  localStore: { insert?: (payload: plainObject) => Promise<any>; [key: string]: any }
  remoteStore: plainObject
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
