import { ActionName, VueSyncError, ActionResultTernary } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { Modified, PlainObject } from './base'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore = <T extends PlainObject>(args: {
  payload: T
  actionName: ActionName
  abort: () => void
}) => undefined | void | Modified<T> | Promise<Modified<T>>

export type EventFnSuccess = <T extends PlainObject, TActionName extends ActionName>(args: {
  payload: Modified<T>
  actionName: TActionName
  result: ActionResultTernary<ActionName>
  abort: () => void
}) => undefined | void | Modified<T> | Promise<Modified<T>>

export type EventFnError = <T extends PlainObject>(args: {
  payload: Modified<T>
  actionName: ActionName
  abort: () => void
  error: VueSyncError
}) => undefined | void | Modified<T> | Promise<Modified<T>>

export type EventFnRevert = <T extends PlainObject, TActionName extends ActionName>(args: {
  payload: T
  actionName: TActionName
  result: ActionResultTernary<ActionName>
}) => undefined | void | Modified<T> | Promise<Modified<T>>

export type EventFn = EventFnBefore | EventFnSuccess | EventFnError | EventFnRevert

export type EventNameFnsMap = {
  before?: EventFnBefore[]
  success?: EventFnSuccess[]
  error?: EventFnError[]
  revert?: EventFnRevert[]
}

// prettier-ignore
export function eventFnsMapWithDefaults (eventNameFnsMap: EventNameFnsMap = {}): O.Compulsory<EventNameFnsMap> {
  return merge({ before: [], success: [], error: [], revert: [] }, eventNameFnsMap)
}

export type EventFnsPerStore = {
  [storeName: string]: EventNameFnsMap
}
