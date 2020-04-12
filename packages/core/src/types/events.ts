import { ActionName, VueSyncError } from './actions'
import { PlainObject } from './base'
import { GetResponse, StreamResponse, DoOnStream, DoOnGet } from './plugins'
import { O } from 'ts-toolbelt'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

type EventSharedPayload = {
  /**
   * write actions: PlainObject | PlainObject[]
   * delete actions: PlainObject | PlainObject[] | string | string[]
   * read actions: PlainObject | void
   */
  payload: PlainObject | PlainObject[] | void | string | string[]
  actionName: ActionName
  storeName: string
  /**
   * stream actions: void // streams cannot be aborted in an event
   * others: () => void
   */
  abort: () => void | void
}

type EventPayloadPropResult = {
  result: void | string | GetResponse | DoOnGet | StreamResponse | DoOnStream
}

export type EventFnBefore = (args: O.Merge<EventSharedPayload, {}>) => void | Promise<void>

export type EventFnSuccess = (
  args: O.Merge<EventSharedPayload, EventPayloadPropResult>
) => void | Promise<void>

export type EventFnError = (
  args: O.Merge<EventSharedPayload, { error: VueSyncError }>
) => void | Promise<void>

export type EventFnRevert = (
  args: O.Merge<O.Omit<EventSharedPayload, 'abort'>, EventPayloadPropResult>
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

export function getEventNameFnsMap (...onMaps: (EventNameFnMap | void)[]): EventNameFnsMap {
  const _onMaps = onMaps.filter(Boolean) as EventNameFnMap[]
  const result: EventNameFnsMap = {
    before: _onMaps.flatMap(on => on.before ?? []),
    success: _onMaps.flatMap(on => on.success ?? []),
    error: _onMaps.flatMap(on => on.error ?? []),
    revert: _onMaps.flatMap(on => on.revert ?? []),
  }
  return result
}
