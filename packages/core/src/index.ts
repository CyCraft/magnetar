import merge from 'merge-anything'
import { ActionName, PluginAction } from './types/actions'
import { CreateModuleWithContext, ModuleConfig } from './CreateModule'
import { Config } from './types/base'

export type VueSyncConfig = {
  stores: {
    [storeName: string]: {
      actions: { [action in ActionName]?: PluginAction }
      config: { [key: string]: any } // any other config the plugin needs
    }
  }
} & Config

function configWithDefaults (config: VueSyncConfig): Required<VueSyncConfig> {
  const defaults: Required<Config> = {
    executionOrder: {
      read: [],
      write: [],
    },
    onError: 'stop',
    on: {},
  }
  return merge(defaults, config)
  // return { ...defaults, ...config }
}

export interface VueSyncInstance {
  config: VueSyncConfig
  createModule: (moduleConfig: ModuleConfig) => ReturnType<typeof CreateModuleWithContext>
}

export function VueSync (vueSyncConfig: VueSyncConfig): VueSyncInstance {
  const globalConfig = configWithDefaults(vueSyncConfig)
  const createModule = (moduleConfig: ModuleConfig): ReturnType<typeof CreateModuleWithContext> =>
    CreateModuleWithContext(moduleConfig, globalConfig)
  return {
    config: globalConfig,
    createModule,
  }
}
