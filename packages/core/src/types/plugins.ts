import { ActionName } from './actions'
import { PlainObject } from './base'
import { isPlainObject } from 'is-what'
import { OnAddedFn, OnModifiedFn, OnRemovedFn } from './modifyReadResponse'
import { O } from 'ts-toolbelt'

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
    delete?: PluginDeleteAction
  }
  revert: PluginRevertAction // the action that reverts other actions on error
  setModuleDataReference: (moduleConfig: PluginModuleConfig) => { [idOrProp: string]: any }
  config: { [key: string]: any } // any other config the plugin needs which is passed by the dev
}

// the `PluginModuleConfig` is the extra config of a plugin when a module is instanciated
export type PluginModuleConfig = PlainObject

export type StreamResponse = { streaming: Promise<void>; stop: () => void }

export type DoOnReadKeys = 'added' | 'modified' | 'removed'

export type DoOnRead = {
  /**
   * 'added' is triggered per document on 3 occasions: on 'get' when a document is read; on 'stream' when initial documents are read; on 'stream' when there are consequent insertions of documents on the end-point.
   */
  added?: OnAddedFn
  /**
   * 'modified' is triggered per document on 1 occasion: on 'stream' when a document that was already read through that stream once before is modified on the end-point.
   */
  modified?: OnModifiedFn
  /**
   * 'removed' is triggered per document on 2 occasions: on 'stream' when a document is "deleted" on the end-point; when a document doesn't adhere to the "stream clauses" any more.
   */
  removed?: OnRemovedFn
}

export type DoOnReadFns = {
  added: OnAddedFn[]
  modified: OnModifiedFn[]
  removed: OnRemovedFn[]
}

export type MustExecuteOnRead = O.Compulsory<DoOnRead>
export type MustExecuteOnGet = {
  added: OnAddedFn
  registerDoOnAdded: (onAddedFn: OnAddedFn) => void
}

export function isDoOnRead (payload: any): payload is DoOnRead {
  const isNotDoOnRead =
    !isPlainObject(payload) ||
    payload.streaming ||
    payload.stop ||
    !(payload.added || payload.modified || payload.removed)
  return !isNotDoOnRead
}

export type PluginStreamAction = (
  payload: object | void,
  pluginModuleConfig: PluginModuleConfig,
  mustExecuteOnRead: MustExecuteOnRead
) => StreamResponse | DoOnRead | Promise<StreamResponse | DoOnRead>

export type PluginGetAction = (
  payload: object | void,
  pluginModuleConfig: PluginModuleConfig,
  mustExecuteOnGet: MustExecuteOnGet
) => void | PlainObject | PlainObject[] | Promise<void | PlainObject | PlainObject[]>

export type PluginDeleteAction = (
  payload: PlainObject | PlainObject[] | string | string[],
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

export type PluginWriteAction = (
  payload: PlainObject | PlainObject[],
  pluginModuleConfig: PluginModuleConfig
) => PlainObject | PlainObject[] | Promise<PlainObject | PlainObject[]>

// the revert action is a bit different, receives the ActionName
export type PluginRevertAction = (
  actionName: ActionName,
  payload: object | object[] | void | string | string[],
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

export type PluginActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? PluginStreamAction
  : TActionName extends 'get'
  ? PluginGetAction
  : TActionName extends 'delete'
  ? PluginDeleteAction
  : PluginWriteAction
