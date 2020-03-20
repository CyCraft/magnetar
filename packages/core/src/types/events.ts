import { ActionName, VueSyncError, ActionResultTernary } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { Modified, PlainObject } from './base'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore = <Payload extends PlainObject | undefined | void>(args: {
  payload: Payload
  actionName: ActionName
  abort: () => void
}) => undefined | void | Modified<Payload> | Promise<Modified<Payload>>

export type EventFnSuccess = <
  Payload extends PlainObject | undefined | void,
  TActionName extends ActionName
>(args: {
  payload: Modified<Payload>
  actionName: TActionName
  result: ActionResultTernary<ActionName>
  abort: () => void
}) =>
  | undefined
  | void
  | Modified<Payload>
  | Promise<Modified<Payload>>
  | Modified<ActionResultTernary<ActionName>>

export type EventFnError = <Payload extends PlainObject | undefined | void>(args: {
  payload: Modified<Payload>
  actionName: ActionName
  abort: () => void
  error: VueSyncError
}) => undefined | void | Modified<Payload> | Promise<Modified<Payload>>

export type EventFnRevert = <
  Payload extends PlainObject | undefined | void,
  TActionName extends ActionName
>(args: {
  payload: Payload
  actionName: TActionName
  result: ActionResultTernary<ActionName>
}) =>
  | undefined
  | void
  | Modified<Payload>
  | Promise<Modified<Payload>>
  | Modified<ActionResultTernary<ActionName>>

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
