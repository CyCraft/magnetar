import { ActionName } from './actions.js'
import {
  DoOnFetch,
  DoOnFetchAggregate,
  DoOnStream,
  FetchAggregateResponse,
  FetchResponse,
  PluginModuleConfig,
  StreamResponse,
  SyncBatch,
} from './plugins.js'
import { MergeDeep } from './utils/MergeDeep.js'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

type EventSharedPayload = {
  /**
   * The path of just the collection
   * @example 'pokedex/001/items'
   * @example 'pokedex'
   */
  collectionPath: string
  /**
   * The id of the document. When this is a nested document, it will not include the full path, only the final part
   * @example '001'
   */
  docId?: string | undefined
  /**
   * The full path of the document or collection
   * @example 'pokedex/001'
   * @example 'pokedex/001/items'
   */
  path: string
  /**
   * The payload that was passed to the action
   * write actions: Record<string, any> | Record<string, any>[]
   * delete actions: Record<string, any> | Record<string, any>[] | string | string[]
   * read actions: Record<string, any> | undefined
   */
  payload: { [key: string]: any } | { [key: string]: any }[] | undefined | string | string[]
  /**
   * The action name for which the current event is being run
   */
  actionName: ActionName
  /**
   * The store name for which the current event is being run
   */
  storeName: string
  /**
   * The module config which is passed to the store plugin for which the current event is being run
   */
  pluginModuleConfig: PluginModuleConfig
  /**
   * stream actions: void // streams cannot be aborted in an event
   * others: () => void
   */
  abort: () => void
}

type EventPayloadPropResult = {
  result:
    | undefined
    | string
    | FetchAggregateResponse
    | DoOnFetchAggregate
    | FetchResponse
    | DoOnFetch
    | StreamResponse
    | DoOnStream
    | SyncBatch
    | [string, SyncBatch]
}

export type EventFnBefore = (args: EventSharedPayload) => void | Promise<void>

export type EventFnSuccess = (
  args: MergeDeep<EventSharedPayload, EventPayloadPropResult>,
) => void | Promise<void>

export type EventFnError = (
  args: MergeDeep<EventSharedPayload, { error: any }>,
) => void | Promise<void>

export type EventFnRevert = (
  args: MergeDeep<Omit<EventSharedPayload, 'abort'>, { result: unknown }>,
) => void | Promise<void>

export type EventFn = EventFnBefore | EventFnSuccess | EventFnError | EventFnRevert

export type EventNameFnMap = {
  before?: EventFnBefore
  success?: EventFnSuccess
  error?: EventFnError
  revert?: EventFnRevert
}

export type EventNameFnsMap = {
  before: EventFnBefore[]
  success: EventFnSuccess[]
  error: EventFnError[]
  revert: EventFnRevert[]
}
