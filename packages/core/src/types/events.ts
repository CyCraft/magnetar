import { ActionName, VueSyncError } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { PlainObject } from './base'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore = (args: {
  /**
   * write actions: PlainObject
   * delete actions: string | string[]
   * read actions: PlainObject | void
   */
  payload: PlainObject | void | string | string[]
  actionName: ActionName
  storeName: string
  /**
   * stream actions: void // streams cannot be aborted in an event
   * others: () => void
   */
  abort: () => void | void
}) => void | Promise<void>

export type EventFnSuccess = (args: {
  /**
   * write actions: PlainObject
   * delete actions: string | string[]
   * read actions: PlainObject | void
   */
  payload: PlainObject | void | string | string[]
  actionName: ActionName
  storeName: string
  result: void | PlainObject | PlainObject[]
  /**
   * stream actions: void // streams cannot be aborted in an event
   * others: () => void
   */
  abort: () => void | void
}) => void | Promise<void>

export type EventFnError = (args: {
  /**
   * write actions: PlainObject
   * delete actions: string | string[]
   * read actions: PlainObject | void
   */
  payload: PlainObject | void | string | string[]
  actionName: ActionName
  storeName: string
  error: VueSyncError
  /**
   * stream actions: void // streams cannot be aborted in an event
   * others: () => void
   */
  abort: () => void | void
}) => void | Promise<void>

export type EventFnRevert = (args: {
  /**
   * write actions: PlainObject
   * delete actions: string | string[]
   * read actions: PlainObject | void
   */
  payload: PlainObject | void | string | string[]
  actionName: ActionName
  storeName: string
  result: void | PlainObject | PlainObject[]
}) => void | Promise<void>

export type EventFn = EventFnBefore | EventFnSuccess | EventFnError | EventFnRevert

export type EventNameFnsMap = {
  before: EventFnBefore[]
  success: EventFnSuccess[]
  error: EventFnError[]
  revert: EventFnRevert[]
}

export function eventFnsMapWithDefaults (
  eventNameFnsMap: Partial<EventNameFnsMap> = {}
): O.Compulsory<EventNameFnsMap> {
  return merge({ before: [], success: [], error: [], revert: [] }, eventNameFnsMap)
}

export function getEventNameFnsMap (
  ...onMaps: ({
    before?: EventFnBefore
    success?: EventFnSuccess
    error?: EventFnError
    revert?: EventFnRevert
  } | void)[]
): EventNameFnsMap {
  const eventFnsMap = eventFnsMapWithDefaults()
  const result = onMaps.reduce((carry, onPerEvent) => {
    if (!onPerEvent) return carry
    Object.entries(onPerEvent).forEach(([eventName, eventFn]: [EventName, EventFn]) => {
      // @ts-ignore
      carry[eventName].push(eventFn)
    })
    return carry
  }, eventFnsMap)
  return result
}
