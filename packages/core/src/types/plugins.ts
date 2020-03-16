import { ActionName } from './actions'
import { PlainObject, Modified } from './base'

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
  setModuleDataReference: <T extends any>(
    moduleConfig: PluginModuleConfig,
    previousStoreData: T
  ) => Modified<T>
  config: { [key: string]: any } // any other config the plugin needs which is passed by the dev
}

// the `PluginModuleConfig` is the extra config of a plugin when a module is instanciated
export type PluginModuleConfig = PlainObject

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.
export type PluginStreamAction = <T extends object>(
                                    payload?: T,
                                    pluginModuleConfig?: PluginModuleConfig
                                  ) => Promise<PlainObject> // prettier-ignore

export type PluginGetAction = <T extends object>(
                                payload?: T,
                                pluginModuleConfig?: PluginModuleConfig
                              ) => Promise<PlainObject[] | PlainObject> // prettier-ignore

export type PluginWriteAction = <T extends object>(
                                  payload: T,
                                  pluginModuleConfig?: PluginModuleConfig
                                ) => Promise<Modified<T>> // prettier-ignore

// the revert action is a bit different, receives the ActionName
export type PluginRevertAction = <T extends object>(
                                    actionName: ActionName,
                                    payload: T,
                                    pluginModuleConfig: PluginModuleConfig
                                  ) => Promise<T> // prettier-ignore
