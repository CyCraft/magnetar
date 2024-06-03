import { Limit, OrderByClause, QueryClause, WhereClause } from './clauses.js'
import { StoreName } from './core.js'
import { EventNameFnMap } from './events.js'
import { ModifyPayloadFnMap } from './modifyPayload.js'
import { ModifyReadResponseFnMap } from './modifyReadResponse.js'
import { PluginInstance } from './plugins.js'

/**
 * Execution order per action or action type.
 */
export type ExecutionOrderConfig = {
  read?: StoreName[]
  write?: StoreName[]
  delete?: StoreName[]
  deleteProp?: StoreName[]
  fetch?: StoreName[]
  stream?: StoreName[]
  insert?: StoreName[]
  merge?: StoreName[]
  assign?: StoreName[]
  replace?: StoreName[]
}

/**
 * The Magnetar global options. Can be overwritten on a per-module or per-action basis.
 */
export type GlobalConfig = {
  stores: {
    /** the cache store, this plugin is responsible for the data to be linked to your UI */
    cache: PluginInstance
    /** any other stores you can choose the key name of */
    [storeName: string]: PluginInstance
  }
  executionOrder?: ExecutionOrderConfig
  onError?: 'revert' | 'continue' | 'stop'
  modifyPayloadOn?: ModifyPayloadFnMap
  modifyReadResponseOn?: ModifyReadResponseFnMap
  on?: EventNameFnMap
}

/**
 * Extra options the dev can pass when creating a module with collection() or doc(). These will take precedence over the global config.
 */
export type ModuleConfig<DocDataType extends { [key: string]: any } = { [key: string]: any }> = {
  query?: QueryClause[]
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
  startAfter?: unknown[] | { [key: string]: any }
  executionOrder?: ExecutionOrderConfig
  onError?: 'revert' | 'continue' | 'stop'
  modifyPayloadOn?: ModifyPayloadFnMap<DocDataType>
  modifyReadResponseOn?: ModifyReadResponseFnMap<DocDataType>
  on?: EventNameFnMap
  /**
   * Custom config the dev can set per Store Plugin. This will be passed to the plugin's action handler.
   */
  configPerStore?: {
    [storeName: string]: { [key: string]: any }
  }
}
