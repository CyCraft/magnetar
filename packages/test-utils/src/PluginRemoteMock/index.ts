import {
  PluginInstance,
  MagnetarPlugin,
  WhereClause,
  OrderByClause,
  Limit,
} from '@magnetarjs/types'
import {
  writeActionFactory,
  insertActionFactory,
  deletePropActionFactory,
  deleteActionFactory,
  fetchActionFactory,
  streamActionFactory,
  revertActionFactory,
} from './actions'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - RemoteStoreOptions
// - StorePluginModuleConfig

export type RemoteStoreOptions = { storeName: string }
export interface StorePluginModuleConfig {
  path?: string
  initialData?: Record<string, any> | [string, Record<string, any>][]
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
}

// a Magnetar plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Magnetar module instance
// each action must have the proper for both collection and doc type modules
export const CreatePlugin: MagnetarPlugin<RemoteStoreOptions> = (
  storePluginOptions: RemoteStoreOptions
): PluginInstance => {
  // the plugin must try to implement logic for every `ActionName`
  const fetch = fetchActionFactory(storePluginOptions)
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
