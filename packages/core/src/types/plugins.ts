import { ActionName } from './actions'
import { PlainObject, Modified } from './base'
import { EventFnSuccess } from './events'

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
  setModuleDataReference: <T extends any>(moduleConfig: PluginModuleConfig) => Modified<T>
  config: { [key: string]: any } // any other config the plugin needs which is passed by the dev
}

// the `PluginModuleConfig` is the extra config of a plugin when a module is instanciated
export type PluginModuleConfig = PlainObject

export type OnNextStoresStream = {
  inserted: ((payload: object) => void)[]
  merged: ((payload: object) => void)[]
  assigned: ((payload: object) => void)[]
  replaced: ((payload: object) => void)[]
  deleted: ((payload: object | string) => void)[]
}

export type PluginStreamAction = <Payload extends object | void>(
  payload: Payload,
  pluginModuleConfig: PluginModuleConfig,
  onNextStoresStream: OnNextStoresStream
) =>
  | void
  | { streaming: Promise<void>; stop: () => void }
  | Promise<void | { streaming: Promise<void>; stop: () => void }>

export type PluginGetAction = <Payload extends object | void>(
  payload: Payload,
  pluginModuleConfig: PluginModuleConfig,
  onNextStoresSuccess: EventFnSuccess[]
) => void | PlainObject | PlainObject[] | Promise<void | PlainObject | PlainObject[]>

export type PluginWriteAction = <Payload extends object | void>(
  payload: Payload,
  pluginModuleConfig: PluginModuleConfig,
  onNextStoresSuccess: EventFnSuccess[]
) => Modified<Payload> | Promise<Modified<Payload>>

// the revert action is a bit different, receives the ActionName
export type PluginRevertAction = <Payload extends object | void>(
  actionName: ActionName,
  payload: Payload,
  pluginModuleConfig: PluginModuleConfig
) =>
  | void
  | PlainObject
  | PlainObject[]
  | Modified<Payload>
  | Promise<void | PlainObject | PlainObject[] | Modified<Payload>>

export type PluginActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? PluginStreamAction
  : TActionName extends 'get'
  ? PluginGetAction
  : PluginWriteAction
