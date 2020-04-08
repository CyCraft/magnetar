import { ActionName } from './actions'
import { PlainObject } from './base'
import { isPlainObject } from 'is-what'
import { OnAddedFn, OnModifiedFn, OnRemovedFn } from './modifyReadResponse'
import { O } from 'ts-toolbelt'

// stores / plugins

// these are the interfaces that plugins need to use and implement

/**
 * A Plugin is a single function that returns a plugin instance. The pluginOptions can be anything the plugin might need to instantiate.
 */
export type VueSyncPlugin = (pluginOptions: any) => PluginInstance

/**
 * The PluginInstance is what a Store Plugin must return. The plugin must implement end-points for each possible action the dev might trigger.
 */
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
  /**
   * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the payload and actionName parameters to revert the state to before.
   */
  revert: PluginRevertAction
  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered upon instantiating a doc.
   */
  returnDocData?: <DocDataType = { [prop: string]: any }>(
    modulePath: string,
    moduleConfig: PluginModuleConfig
  ) => DocDataType
  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered upon instantiating a collection.
   */
  returnCollectionData?: <DocDataType = { [prop: string]: any }>(
    modulePath: string,
    moduleConfig: PluginModuleConfig
  ) => Map<string, DocDataType>
}

/**
 * Extra config a dev might pass when instanciates a module as second param (under `configPerStore`). Eg. `collection('pokedex', { configPerStore: { local: pluginModuleConfig } })`
 */
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

/**
 * The functions for 'added', 'modified' and 'removed' **must** be executed by the plugin whenever the stream sees any of these changes. These are the functions that will pass the data to the other "local" Store Plugins.
 */
export type MustExecuteOnRead = O.Compulsory<DoOnRead>

/**
 * When the plugin only fetches data and doesn't act as a local store, it must do `return added(doc, metaData)` or return an array mapped with the `added` function. When the plugin only acts as local store, it must execute `registerDoOnAdded` by providing it a function handler that will be executed by other "remote" Store Plugins.
 */
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
  payload: PlainObject | void,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig,
  mustExecuteOnRead: MustExecuteOnRead
) => StreamResponse | DoOnRead | Promise<StreamResponse | DoOnRead>

export type PluginGetAction = (
  payload: PlainObject | void,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig,
  mustExecuteOnGet: MustExecuteOnGet
) => void | PlainObject | PlainObject[] | Promise<void | PlainObject | PlainObject[]>

/**
 * In case of the `insert` action, it must return the new document's ID! When `modulePath` is a document, the ID is its last chunk. When `modulePath` is a collection, an ID must be generated.
 */
export type PluginWriteAction = (
  payload: PlainObject,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => void | string | Promise<void | string>

export type PluginDeletePropAction = (
  payload: string | string[],
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

export type PluginDeleteAction = (
  payload: void,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

/**
 * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the payload and actionName parameters to revert the state to before.
 */
export type PluginRevertAction = (
  payload: object | object[] | void | string | string[],
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig,
  actionName: ActionName
) => void | Promise<void>

export type PluginActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? PluginStreamAction
  : TActionName extends 'get'
  ? PluginGetAction
  : TActionName extends 'delete'
  ? PluginDeleteAction
  : TActionName extends 'deleteProp'
  ? PluginDeletePropAction
  : PluginWriteAction
