import { ActionName } from './actions.js'
import { CacheStoreAddedResult } from './modifyReadResponse.js'
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

/**
 * The type of stream event when actionName is 'stream'.
 * - 'added': A new document was added to the stream
 * - 'modified': An existing document was modified
 * - 'removed': A document was removed from the stream
 */
export type StreamEvent = 'added' | 'modified' | 'removed'

type EventSharedPayload<DocDataType extends { [key: string]: any } = { [key: string]: any }> = {
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
  payload: { [key: string]: any } | undefined | string
  /** A reference pointer to the current document data */
  current: Readonly<DocDataType> | undefined
  /** Magnetar only updates fields if they are different. The diff that was applied will be available here for success events. Returns 'na' for before, error, revert, or where the `actionName` does not relate, like eg. `fetch`. */
  diffApplied: Readonly<Partial<DocDataType>> | 'removed' | 'na'
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
  /**
   * Only present when actionName is 'stream'. Indicates the type of stream event:
   * - 'added': A new document was added to the stream
   * - 'modified': An existing document was modified
   * - 'removed': A document was removed from the stream
   */
  streamEvent?: StreamEvent | undefined
}

type EventPayloadPropResult = {
  result:
    | undefined
    | string
    | CacheStoreAddedResult
    | FetchAggregateResponse
    | DoOnFetchAggregate
    | FetchResponse
    | DoOnFetch
    | StreamResponse
    | DoOnStream
    | SyncBatch
    | [string, SyncBatch]
}

export type EventFnBefore<DocDataType extends { [key: string]: any } = { [key: string]: any }> = (
  args: EventSharedPayload<DocDataType>,
) => void | Promise<void>

export type EventFnSuccess<DocDataType extends { [key: string]: any } = { [key: string]: any }> = (
  args: MergeDeep<EventSharedPayload<DocDataType>, EventPayloadPropResult>,
) => void | Promise<void>

export type EventFnError<DocDataType extends { [key: string]: any } = { [key: string]: any }> = (
  args: MergeDeep<EventSharedPayload<DocDataType>, { error: any }>,
) => void | Promise<void>

export type EventFnRevert<DocDataType extends { [key: string]: any } = { [key: string]: any }> = (
  args: MergeDeep<Omit<EventSharedPayload<DocDataType>, 'abort'>, { result: unknown }>,
) => void | Promise<void>

export type EventNameFnMap<DocDataType extends { [key: string]: any } = { [key: string]: any }> = {
  before?: EventFnBefore<DocDataType>
  success?: EventFnSuccess<DocDataType>
  error?: EventFnError<DocDataType>
  revert?: EventFnRevert<DocDataType>
}

export type EventNameFnsMap<DocDataType extends { [key: string]: any } = { [key: string]: any }> = {
  before: EventFnBefore<DocDataType>[]
  success: EventFnSuccess<DocDataType>[]
  error: EventFnError<DocDataType>[]
  revert: EventFnRevert<DocDataType>[]
}
