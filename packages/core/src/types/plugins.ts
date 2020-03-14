import { ActionName } from './actions'
import { PlainObject, OnRetrieveHandler, Modified } from './base'
import { ModuleType } from '../CreateModule'

// stores / plugins

// these are the interfaces that plugins need to use and implement

// a plugin is a function that returns a `PluginInstance`
export type Plugin = (any: any) => PluginInstance

// the `PluginInstance` is what's used by Vue Sync internally
export interface PluginInstance {
  actions: {
    get?: PluginGetAction
    stream?: PluginStreamAction
    insert?: PluginWriteAction
    merge?: PluginWriteAction
    assign?: PluginWriteAction
    replace?: PluginWriteAction
    delete?: PluginWriteAction
  }
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
export type PluginStreamAction = <T extends object>(
                                    payload?: T,
                                    pluginActionConfig?: PluginActionConfig
                                  ) => Promise<PlainObject> // prettier-ignore

export type PluginGetAction = <T extends object>(
                                onRetrieveHandlers: OnRetrieveHandler[],
                                payload?: T,
                                pluginActionConfig?: PluginActionConfig
                              ) => Promise<PlainObject[] | PlainObject> // prettier-ignore

export type PluginWriteAction = <T extends object>(
                                  payload: T,
                                  pluginActionConfig?: PluginActionConfig
                                ) => Promise<Modified<T>> // prettier-ignore

// the revert action is a bit different, receives the ActionName
export type PluginRevertAction = <T extends object>(
                                    actionName: ActionName,
                                    payload: T,
                                    pluginActionConfig: PluginActionConfig
                                  ) => Promise<T> // prettier-ignore
