import { ModifyPayloadFnMap } from './modifyPayload'
import { ModifyReadResponseFnMap } from './modifyReadResponse'
import { EventNameFnMap } from './events'
import { PluginInstance } from './plugins'
import { StoreName } from './core'
import { Limit, OrderByClause, WhereClause } from './clauses'

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
  /**
   * the storeName of the plugin that will keep your local data cache for usage with your client.
   */
  localStoreName: StoreName
  stores: { [storeName: string]: PluginInstance }
  executionOrder?: ExecutionOrderConfig
  onError?: 'revert' | 'continue' | 'stop'
  modifyPayloadOn?: ModifyPayloadFnMap
  modifyReadResponseOn?: ModifyReadResponseFnMap
  on?: EventNameFnMap
}

/**
 * Extra options the dev can pass when creating a module with collection() or doc(). These will take precedence over the global config.
 */
export type ModuleConfig<DocDataType extends Record<string, any> = Record<string, any>> = {
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
  startAfter?: unknown[] | Record<string, any>
  executionOrder?: ExecutionOrderConfig
  onError?: 'revert' | 'continue' | 'stop'
  modifyPayloadOn?: ModifyPayloadFnMap<DocDataType>
  modifyReadResponseOn?: ModifyReadResponseFnMap<DocDataType>
  on?: EventNameFnMap
  /**
   * Custom config the dev can set per Store Plugin. This will be passed to the plugin's action handler.
   */
  configPerStore?: {
    [storeName: string]: Record<string, any>
  }
}
