import { O } from 'ts-toolbelt'
import { isPlainObject, isFunction, isArray } from 'is-what'
import { ActionName } from './actions'
import { PlainObject, DocMetadata } from './atoms'
import { OnAddedFn, OnModifiedFn, OnRemovedFn } from './modifyReadResponse'

// stores / plugins

// these are the interfaces that plugins need to use and implement

/**
 * A Plugin is a single function that returns a plugin instance. The pluginOptions can be anything the plugin might need to instantiate.
 */
export type VueSyncPlugin<PluginOptions> = (pluginOptions: PluginOptions) => PluginInstance

/**
 * The PluginInstance is what a Store Plugin must return. The plugin must implement end-points for each possible action the dev might trigger.
 */
export interface PluginInstance {
  actions: {
    get?: PluginGetAction
    stream?: PluginStreamAction
    insert?: PluginInsertAction
    merge?: PluginWriteAction
    assign?: PluginWriteAction
    replace?: PluginWriteAction
    deleteProp?: PluginDeletePropAction
    delete?: PluginDeleteAction
  }
  /**
   * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the payload and actionName parameters to revert the state to before.
   */
  revert: PluginRevertAction
  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
   */
  setupModule?: (modulePath: string, moduleConfig: PluginModuleConfig) => void
  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  getModuleData?: (
    modulePath: string,
    moduleConfig: PluginModuleConfig
  ) => PlainObject | Map<string, PlainObject>
}

/**
 * Extra config a dev might pass when instanciates a module as second param (under `configPerStore`). Eg. `collection('pokedex', { configPerStore: { local: pluginModuleConfig } })`
 */
export type PluginModuleConfig = PlainObject | any

// each of the following actions must be implemented by the plugin!

/**
 * Should handle 'stream' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc). Should return `StreamResponse` when acting as a "remote" Store Plugin, and `DoOnStream` when acting as "local" Store Plugin.
 */
export type PluginStreamAction = (
  payload: PlainObject | void,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig,
  mustExecuteOnRead: MustExecuteOnRead
) => StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream>

/**
 * Should handle 'get' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc). Should return `GetResponse` when acting as a "remote" Store Plugin, and `DoOnGet` when acting as "local" Store Plugin.
 */
export type PluginGetAction = (
  payload: PlainObject | void,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig,
  clauses: { where: string[][] }
) => GetResponse | DoOnGet | Promise<GetResponse | DoOnGet>

/**
 * Should handle 'merge' 'assign' 'replace' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 */
export type PluginWriteAction = (
  payload: PlainObject,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

/**
 * Should handle 'insert' for collections & docs. Must return the new document's ID! When executed on a collection, the plugin must provide a newly generated ID. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc)
 */
export type PluginInsertAction = (
  payload: PlainObject,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => string | Promise<string>

/**
 * Should handle 'deleteProp' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 */
export type PluginDeletePropAction = (
  payload: string | string[],
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

/**
 * Should handle 'delete' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 */
export type PluginDeleteAction = (
  payload: void,
  modulePath: string,
  pluginModuleConfig: PluginModuleConfig
) => void | Promise<void>

/**
 * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the payload and actionName parameters to revert the state to before.
 */
export type PluginRevertAction = (
  payload: PlainObject | PlainObject[] | void | string | string[],
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
  : TActionName extends 'insert'
  ? PluginInsertAction
  : PluginWriteAction

// 'stream' related

/**
 * Plugin's response to a 'stream' action, when acting as a "remote" Store Plugin.
 */
export type StreamResponse = { streaming: Promise<void>; stop: () => void }

/**
 * Plugin's response to a 'stream' action, when acting as a "local" Store Plugin.
 */
export type DoOnStream = {
  /**
   * 'added' is/should be triggered per document on 3 occasions: on 'get' when a document is read; on 'stream' when initial documents are read; on 'stream' when there are consequent insertions of documents on the end-point.
   */
  added?: OnAddedFn
  /**
   * 'modified' is/should be triggered per document on 1 occasion: on 'stream' when a document that was already read through that stream once before is modified on the end-point.
   */
  modified?: OnModifiedFn
  /**
   * 'removed' is/should be triggered per document on 2 occasions: on 'stream' when a document is "deleted" on the end-point; when a document doesn't adhere to the "stream clauses" any more.
   */
  removed?: OnRemovedFn
}

/**
 * internal
 */
export type DoOnStreamFns = {
  added: OnAddedFn[]
  modified: OnModifiedFn[]
  removed: OnRemovedFn[]
}

/**
 * The functions for 'added', 'modified' and 'removed' **must** be executed by the plugin whenever the stream sees any of these changes. These are the functions that will pass the data to the other "local" Store Plugins.
 */
export type MustExecuteOnRead = O.Compulsory<DoOnStream>

/**
 * DoOnStream type guard
 */
export function isDoOnStream (payload: any): payload is DoOnStream {
  const isNotDoOnStream =
    !isPlainObject(payload) ||
    payload.streaming ||
    payload.stop ||
    !(payload.added || payload.modified || payload.removed)
  return !isNotDoOnStream
}

// 'get' related

/**
 * Plugin's response to a 'get' action, when acting as a "remote" Store Plugin.
 */
export type GetResponse = {
  docs: DocMetadata[]
}

/**
 * Plugin's response to a 'get' action, when acting as a "local" Store Plugin.
 */
export type DoOnGet = OnAddedFn

/**
 * DoOnGet type guard
 */
export function isDoOnGet (payload: any): payload is DoOnGet {
  return isFunction(payload)
}

/**
 * GetResponse type guard
 */
export function isGetResponse (payload: any): payload is GetResponse {
  return isPlainObject(payload) && isArray(payload.docs)
}
