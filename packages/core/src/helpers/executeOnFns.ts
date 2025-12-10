import type {
  DocMetadata,
  DoOnFetch,
  EventFnBefore,
  EventFnSuccess,
  OnAddedFn,
  OnModifiedFn,
  OnRemovedFn,
  PluginModuleConfig,
  StreamEvent,
} from '@magnetarjs/types'

/**
 * Context needed to execute stream event functions
 */
type StreamEventContext = {
  collectionPath: string
  docId: string
  path: string
  pluginModuleConfig: PluginModuleConfig
  storeName: string
  streamEvent: StreamEvent
}

/**
 * Event functions to execute before/after cache insertion
 */
type StreamEventFns = {
  before: EventFnBefore[]
  success: EventFnSuccess[]
}

/**
 * Executes given function array with given args-array deconstructed, it will always use replace the first param with whatever the response of each function was.
 */
export function executeOnFns<Payload extends { [key: string]: any } | string | undefined>(params: {
  modifyReadResultFns: (OnAddedFn | OnModifiedFn | OnRemovedFn)[]
  cacheStoreFns: (DoOnFetch | OnAddedFn | OnModifiedFn | OnRemovedFn)[]
  payload: Payload
  docMetaData: DocMetadata
  /** Optional: event functions and context for per-document stream events */
  eventFns?: StreamEventFns
  eventContext?: StreamEventContext
}): Payload | undefined {
  const { modifyReadResultFns, cacheStoreFns, payload, docMetaData, eventFns, eventContext } =
    params

  let newPayload = payload

  let shouldAbort = false
  // Execute 'before' event functions (sync, fire-and-forget for async)
  if (eventFns && eventContext) {
    const eventPayload = {
      payload: newPayload,
      actionName: 'stream' as const,
      storeName: eventContext.storeName,
      collectionPath: eventContext.collectionPath,
      docId: eventContext.docId,
      path: eventContext.path,
      pluginModuleConfig: eventContext.pluginModuleConfig,
      streamEvent: eventContext.streamEvent,
      abort: () => (shouldAbort = true),
    }
    for (const fn of eventFns.before) {
      if (shouldAbort) break
      fn(eventPayload) // fire-and-forget: don't await
    }
  }
  if (shouldAbort) return undefined

  for (const fn of modifyReadResultFns) {
    // we only want to execute these when there is a payload
    if (newPayload) newPayload = fn(newPayload as any, docMetaData) as any
  }
  for (const fn of cacheStoreFns) {
    // we only want to execute these always, regardless wether or not there's a payload
    newPayload = fn(newPayload as any, docMetaData) as any
  }

  // Execute 'success' event functions (sync, fire-and-forget for async)
  if (eventFns && eventContext) {
    const eventPayload = {
      payload: newPayload,
      result: newPayload,
      actionName: 'stream' as const,
      storeName: eventContext.storeName,
      collectionPath: eventContext.collectionPath,
      docId: eventContext.docId,
      path: eventContext.path,
      pluginModuleConfig: eventContext.pluginModuleConfig,
      streamEvent: eventContext.streamEvent,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      abort: () => {}, // no-op for stream events
    }
    for (const fn of eventFns.success) {
      fn(eventPayload) // fire-and-forget: don't await
    }
  }

  return newPayload
}
