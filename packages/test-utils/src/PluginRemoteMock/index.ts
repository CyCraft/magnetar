import type {
  Limit,
  MagnetarPlugin,
  OrderByClause,
  PluginInstance,
  QueryClause,
  WhereClause,
} from '@magnetarjs/types'
import {
  deleteActionFactory,
  deletePropActionFactory,
  fetchActionFactory,
  fetchCountActionFactory,
  fetchSumAverageActionFactory,
  insertActionFactory,
  revertActionFactory,
  streamActionFactory,
  writeActionFactory,
} from './actions.js'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - RemoteStoreOptions
// - StorePluginModuleConfig

export type RemoteStoreOptions = { storeName: string }
export type StorePluginModuleConfig = {
  path?: string
  initialData?: { [key: string]: unknown } | [string, { [key: string]: unknown }][]
  query?: QueryClause[]
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
}

// a Magnetar plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Magnetar module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: MagnetarPlugin<RemoteStoreOptions> = (
  storePluginOptions: RemoteStoreOptions,
): PluginInstance => {
  // the plugin must try to implement logic for every `ActionName`
  const fetch = fetchActionFactory(storePluginOptions)
  const fetchCount = fetchCountActionFactory(storePluginOptions)
  const fetchSum = fetchSumAverageActionFactory('sum', storePluginOptions)
  const fetchAverage = fetchSumAverageActionFactory('average', storePluginOptions)
  const stream = streamActionFactory(storePluginOptions)
  const insert = insertActionFactory(storePluginOptions)
  const _merge = writeActionFactory(storePluginOptions, 'merge')
  const assign = writeActionFactory(storePluginOptions, 'assign')
  const replace = writeActionFactory(storePluginOptions, 'replace')
  const deleteProp = deletePropActionFactory(storePluginOptions)
  const _delete = deleteActionFactory(storePluginOptions)
  const revert = revertActionFactory(storePluginOptions)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = {
    revert,
    actions: {
      fetch,
      fetchCount,
      fetchSum,
      fetchAverage,
      stream,
      insert,
      merge: _merge,
      deleteProp,
      assign,
      replace,
      delete: _delete,
    },
  }
  return instance
}
