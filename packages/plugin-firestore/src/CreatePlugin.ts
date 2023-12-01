import type { MagnetarPlugin, PluginInstance } from '@magnetarjs/types'
import type {
  BatchSync,
  FirestorePluginOptions as PluginOptions,
} from '@magnetarjs/utils-firestore'
import type { Firestore } from 'firebase/firestore'
import { deleteActionFactory } from './actions/delete'
import { deletePropActionFactory } from './actions/deleteProp'
import { fetchActionFactory } from './actions/fetch'
import { fetchCountActionFactory } from './actions/fetchCount'
import { insertActionFactory } from './actions/insert'
import { writeActionFactory } from './actions/mergeAssignReplace'
import { revertActionFactory } from './actions/revert'
import { streamActionFactory } from './actions/stream'

export type FirestorePluginOptions = PluginOptions<Firestore>
export type { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for this plugin we use:
// - FirestorePluginOptions
// - FirestoreModuleConfig

function firestorePluginOptionsWithDefaults(
  firestorePluginOptions: FirestorePluginOptions
): Required<FirestorePluginOptions> {
  return {
    syncDebounceMs: 1000,
    useModulePathsForFirestore: true,
    debug: false,
    ...firestorePluginOptions,
  }
}

/** A map with the `collectionPath` as key and a `BatchSync` instance as value */
export type BatchSyncMap = Map<string, BatchSync>

// a Magnetar plugin is a single function that returns a `PluginInstance`
// the plugin implements the logic for all actions that a can be called from a Magnetar module instance
// each action must have the proper for both collection and doc type modules

/**
 * It's required to pass the Firestore instance to make sure there are not two separate instances running which can cause issues.
 * As long as Firebase is initialized before you pass it, you can just import and pass it like so:
 * @example
 * ```js
 * import { initializeApp } from 'firebase/app'
 * import { getFirestore } from 'firebase/firestore'
 * import { CreatePlugin as FirestorePlugin } from '@magnetarjs/firestore'
 *
 * const firebaseApp = initializeApp({  }) // pass config
 * const db = getFirestore(firebaseApp)
 *
 * // initialise plugin
 * const remote = FirestorePlugin({ db })
 * ```
 */
export const CreatePlugin: MagnetarPlugin<FirestorePluginOptions> = (
  firestorePluginOptions: FirestorePluginOptions
): PluginInstance => {
  const pluginOptions = firestorePluginOptionsWithDefaults(firestorePluginOptions)

  /** A map with the `collectionPath` as key and a `BatchSync` instance as value */
  const batchSyncMap: BatchSyncMap = new Map()

  async function syncPendingWrites() {
    const promises: Promise<void>[] = []
    for (const [_path, batchSync] of batchSyncMap) {
      if (batchSync) promises.push(batchSync.forceSyncEarly())
    }
    await Promise.all(promises)
  }

  // the plugin must try to implement logic for every `ActionName`
  const fetch = fetchActionFactory(pluginOptions)
  const fetchCount = fetchCountActionFactory(pluginOptions)
  const stream = streamActionFactory(pluginOptions)
  const insert = insertActionFactory(batchSyncMap, pluginOptions)
  const _merge = writeActionFactory(batchSyncMap, pluginOptions, 'merge')
  const assign = writeActionFactory(batchSyncMap, pluginOptions, 'assign')
  const replace = writeActionFactory(batchSyncMap, pluginOptions, 'replace')
  const deleteProp = deletePropActionFactory(batchSyncMap, pluginOptions)
  const _delete = deleteActionFactory(batchSyncMap, pluginOptions)

  const actions = {
    fetch,
    fetchCount,
    stream,
    insert,
    merge: _merge,
    assign,
    replace,
    deleteProp,
    delete: _delete,
  }
  const revert = revertActionFactory(actions, pluginOptions)

  // the plugin function must return a `PluginInstance`
  const instance: PluginInstance = { revert, actions, syncPendingWrites }
  return instance
}
