import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { CreateModuleWithContext, ModuleConfig, VueSyncModuleInstance } from './CreateModule'
import { SharedConfig } from './types/base'
import { PluginInstance } from './types/plugins'

// this is what the dev passes as config to instanciate VueSync
export type VueSyncConfig = O.Merge<
  Partial<SharedConfig>,
  {
    stores: {
      [storeName: string]: PluginInstance
    }
  }
>

function configWithDefaults (config: VueSyncConfig): O.Compulsory<VueSyncConfig> {
  const defaults: SharedConfig = {
    executionOrder: {
      read: [],
      write: [],
    },
    onError: 'stop',
    on: {},
    modifyPayloadOn: {},
    modifyReadResponseOn: {},
  }
  const merged = merge(defaults, config)
  return merged
}

// this is the global VueSync instance
export interface VueSyncInstance {
  globalConfig: O.Compulsory<VueSyncConfig>
  createModule: CreateModule
}

// this is the `CreateModule` action exposed on the VueSync instance
export type CreateModule = (moduleConfig: ModuleConfig) => VueSyncModuleInstance

export function VueSync (vueSyncConfig: VueSyncConfig): VueSyncInstance {
  // the passed VueSyncConfig is merged onto defaults
  const globalConfig = configWithDefaults(vueSyncConfig)

  const createModule: CreateModule = moduleConfig =>
    CreateModuleWithContext(moduleConfig, globalConfig)

  const instance: VueSyncInstance = {
    globalConfig,
    createModule,
  }
  return instance
}
