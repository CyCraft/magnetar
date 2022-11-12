/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Spread } from 'type-fest'
import { ActionConfig, ActionName, FetchMetaData } from './actions'
import { DocMetadata } from './core'
import { OnAddedFn, OnModifiedFn, OnRemovedFn } from './modifyReadResponse'
import { Clauses } from './clauses'

// stores / plugins

// these are the interfaces that plugins need to use and implement
type DocumentPath = string
export type SyncBatch = {
  insert: Map<DocumentPath, Record<string, any>>
  assign: Map<DocumentPath, Record<string, any>>
  merge: Map<DocumentPath, Record<string, any>>
  replace: Map<DocumentPath, Record<string, any>>
  deleteProp: Map<DocumentPath, Set<string>>
  delete: Set<string>
}

/**
 * A Plugin is a single function that returns a plugin instance. The pluginOptions can be anything the plugin might need to instantiate.
 */
export type MagnetarPlugin<PluginOptions> = (pluginOptions: PluginOptions) => PluginInstance

/**
 * The PluginInstance is what a Store Plugin must return. The plugin must implement end-points for each possible action the dev might trigger.
 */
export interface PluginInstance {
  actions: {
    fetch?: PluginFetchAction
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
  setupModule?: (pluginModuleSetupPayload: PluginModuleSetupPayload) => void
  /**
   * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
   */
  getModuleData?: (
    pluginModuleSetupPayload: PluginModuleSetupPayload
  ) => Record<string, any> | Map<string, Record<string, any>>
  /**
   * This is an optional function that some "remote" Store Plugins can provide to sync any pending writes that might have stacked because of a `syncDebounceMs`.
   */
  syncPendingWrites?: () => Promise<void>
}

/**
 * Where, orderBy, limit clauses or extra config a dev might pass when instanciates a module as second param (under `configPerStore`). Eg. `collection('pokedex', { configPerStore: { local: pluginModuleConfig } })`
 */
export type PluginModuleConfig = Spread<Clauses, { [key in string]: any }>

/**
 * The payload the core lib will pass when executing plugin's `setupModule` and `getModuleData` functions.
 */
export type PluginModuleSetupPayload<SpecificPluginModuleConfig = PluginModuleConfig> = {
  /**
   * The collection path the action was called on.
   */
  collectionPath: string
  /**
   * The doc id the action was called on. If `undefined` it means the action is being triggered on a collection.
   */
  docId: string | undefined
  /**
   * Represents the pluginModuleConfig on which the action is triggered. The developer that uses the plugin will pass the `pluginModuleConfig` like so: `collection('myCollection', { configPerStore: { storeName: pluginModuleConfig } })`
   */
  pluginModuleConfig: SpecificPluginModuleConfig
}

/**
 * The base payload passed to a plugin on the execution of any action.
 */
export type PluginActionPayloadBase<SpecificPluginModuleConfig = PluginModuleConfig> = {
  /**
   * The collection path the action was called on.
   */
  collectionPath: string
  /**
   * The doc id the action was called on. If `undefined` it means the action is being triggered on a collection.
   */
  docId: string | undefined
  /**
   * Represents the pluginModuleConfig on which the action is triggered. The developer that uses the plugin will pass the `pluginModuleConfig` like so: `collection('myCollection', { configPerStore: { storeName: pluginModuleConfig } })`
   */
  pluginModuleConfig: SpecificPluginModuleConfig
  /**
   * Any extra config the dev might pass
   */
  actionConfig: ActionConfig
}

// each of the following actions must be implemented by the plugin!

export type PluginStreamActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any> | void
    /**
     * MustExecuteOnRead:
     * The functions for 'added', 'modified' and 'removed' **must** be executed by the plugin whenever the stream sees any of these changes. These are the functions that will pass the data to the other "local" Store Plugins.
     */
    mustExecuteOnRead: MustExecuteOnRead
  }
>

/**
 * Should handle 'stream' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc). Should return `StreamResponse` when acting as a "remote" Store Plugin, and `DoOnStream` when acting as "local" Store Plugin.
 */
export type PluginStreamAction = (
  payload: PluginStreamActionPayload
) => StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream>

export type PluginFetchActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: { force?: boolean } | Record<string, any> | void
  }
>

/**
 * Should handle 'fetch' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc). Should return `FetchResponse` when acting as a "remote" Store Plugin, and `DoOnFetch` when acting as "local" Store Plugin.
 */
export type PluginFetchAction = (
  payload: PluginFetchActionPayload
) => FetchResponse | DoOnFetch | Promise<FetchResponse | DoOnFetch>

export type PluginWriteActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any>
  }
>

/**
 * Should handle 'merge' 'assign' 'replace' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 * @returns
 *   - `void` if the plugin writes one by one
 *   - `SyncBatch` If the plugin batches multiple write actions together, it will return the sync batch information
 */
export type PluginWriteAction = (
  payload: PluginWriteActionPayload
) => void | Promise<void | SyncBatch>

export type PluginInsertActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any>
  }
>

/**
 * Should handle 'insert' for collections & docs. Must return the new document's ID! When executed on a collection, the plugin must provide a newly generated ID. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc)
 * @returns
 *   - `string` if the plugin writes one by one — the new document's ID
 *   - `[string, SyncBatch]` if the plugin batches multiple write actions together — (1) the new document's ID (2) the sync batch information
 */
export type PluginInsertAction = (
  payload: PluginInsertActionPayload
) => string | Promise<string | [string, SyncBatch]>

export type PluginDeletePropActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: string | string[]
    /**
     * docId must be provided
     */
    docId: string
  }
>

/**
 * Should handle 'deleteProp' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 * @returns
 *   - `void` if the plugin writes one by one
 *   - `SyncBatch` If the plugin batches multiple write actions together, it will return the sync batch information
 */
export type PluginDeletePropAction = (
  payload: PluginDeletePropActionPayload
) => void | Promise<void | SyncBatch>

export type PluginDeleteActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: void | any
  }
>

/**
 * Should handle 'delete' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 * @returns
 *   - `void` if the plugin writes one by one
 *   - `SyncBatch` If the plugin batches multiple write actions together, it will return the sync batch information
 */
export type PluginDeleteAction = (
  payload: PluginDeleteActionPayload
) => void | Promise<void | SyncBatch>

export type PluginRevertActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = Spread<
  PluginActionPayloadBase<SpecificPluginModuleConfig>,
  {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any> | Record<string, any>[] | void | string | string[]
    /**
     * Whatever action was originally triggered when an error was thrown. This is the action that will need to be reverted by this function.
     */
    actionName: ActionName
    /**
     * Whatever error was thrown that caused the need for reverting.
     */
    error: any
  }
>

/**
 * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the `payload` and `actionName` parameters to determine how to revert the plugin's state to its previous state.
 */
export type PluginRevertAction = (payload: PluginRevertActionPayload) => void | Promise<void>

export type PluginActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? PluginStreamAction
  : TActionName extends 'fetch'
  ? PluginFetchAction
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
   * 'added' will/should be triggered per document on 3 occasions: on 'fetch' when a document is read; on 'stream' when initial documents are read; on 'stream' when there are consequent insertions of documents on the end-point.
   *
   * As local store plugin this should be a function that covers the logic to save the payload to the local state.
   * As remote store plugin this is what must be executed during the events.
   */
  added?: OnAddedFn
  /**
   * 'modified' will/should be triggered per document on 1 occasion: on 'stream' when a document that was already read through that stream once before is modified on the end-point.
   *
   * As local store plugin this should be a function that covers the logic to update the payload in the local state.
   * As remote store plugin this is what must be executed during the events.
   */
  modified?: OnModifiedFn
  /**
   * 'removed' will/should be triggered per document on 2 occasions: on 'stream' when a document is "deleted" on the end-point; when a document doesn't adhere to the "stream clauses" any more.
   *
   * As local store plugin this should be a function that covers the logic to remove the payload from the local state.
   * As remote store plugin this is what must be executed during the events.
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
 * MustExecuteOnRead:
 * The functions for 'added', 'modified' and 'removed' **must** be executed by the plugin whenever the stream sees any of these changes. These are the functions that will pass the data to the other "local" Store Plugins.
 */
export type MustExecuteOnRead = Required<DoOnStream>

// 'fetch' related

/**
 * Plugin's response to a 'fetch' action, when acting as a "remote" Store Plugin.
 *
 * Optimistic fetch responses don't need to return `reachedEnd` nor `cursor`
 */
export type FetchResponse = {
  docs: DocMetadata[]
  /** Wether or not the end was reached, in case there is no `limit` this is always true */
  reachedEnd?: boolean
  /** The last fetched doc */
  cursor?: unknown
}

/**
 * Plugin's response to a 'fetch' action, when acting as a "local" Store Plugin.
 */
export type DoOnFetch = OnAddedFn
