import { ActionName } from './actions'
import { PlainObject } from './base'
import { ModuleType } from '../CreateModule'

// stores / plugins

// these are the interfaces that plugins need to use and implement

// a plugin is a function that returns a `PluginInstance`
export type Plugin = (any: any) => PluginInstance

// the `PluginInstance` is what's used by Vue Sync internally
export interface PluginInstance {
  actions: { [action in ActionName]?: PluginAction }
  revert: PluginRevertAction // the action that reverts other actions on error
  config: { [key: string]: any } // any other config the plugin needs
}

// the `PluginActionConfig` is extra config passed when an action is executed by the dev via the VueSyncModule
export interface PluginActionConfig {
  moduleType: ModuleType
  moduleConfig: {
    [key: string]: any // whatever the dev passed for this plugin when creating a Vue Sync Module instance (`VueSyncPluginModuleConfig`)
  }
}

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.
export type PluginReadAction = <T extends PlainObject>(
                                  payload: T,
                                  pluginActionConfig?: PluginActionConfig
                                ) => Promise<Partial<T>> // prettier-ignore
export type PluginWriteAction = <T extends PlainObject>(
                                  payload: T,
                                  pluginActionConfig?: PluginActionConfig
                                ) => Promise<Partial<T>> // prettier-ignore
export type PluginAction = PluginReadAction | PluginWriteAction

// the revert action is a bit different, receives the ActionName
export type PluginRevertAction = <T extends PlainObject>(
                                    actionName: ActionName,
                                    payload: T,
                                    pluginActionConfig: PluginActionConfig
                                  ) => Promise<T> // prettier-ignore
