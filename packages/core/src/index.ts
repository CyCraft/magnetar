import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { CreateModuleWithContext, ModuleConfig } from './CreateModule'
import { Config, PluginInstance } from './types/base'

export type VueSyncConfig = O.Merge<
  Partial<Config>,
  {
    stores: {
      [storeName: string]: PluginInstance
    }
  }
>

function configWithDefaults (config: VueSyncConfig): O.Compulsory<VueSyncConfig> {
  const defaults: Config = {
    executionOrder: {
      read: [],
      write: [],
    },
    onError: 'stop',
    on: {},
  }
  const merged = merge(defaults, config)
  return merged
}

export interface VueSyncInstance {
  globalConfig: O.Compulsory<VueSyncConfig>
  createModule: (moduleConfig: ModuleConfig) => ReturnType<typeof CreateModuleWithContext>
}

export function VueSync (vueSyncConfig: VueSyncConfig): VueSyncInstance {
  const globalConfig = configWithDefaults(vueSyncConfig)
  const createModule = (moduleConfig: ModuleConfig): ReturnType<typeof CreateModuleWithContext> =>
    CreateModuleWithContext(moduleConfig, globalConfig)
  return {
    globalConfig,
    createModule,
  }
}
