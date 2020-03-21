import { ActionName, VueSyncError } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { Modified, PlainObject } from './base'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore<
  TActionNameDefault extends ActionName = ActionName,
  PayloadPassed extends PlainObject | undefined | void = PlainObject
> = <Payload extends PlainObject | undefined | void, TActionName extends TActionNameDefault>(args: {
  payload: Payload | PayloadPassed
  actionName: TActionName
  abort: TActionName extends 'stream' ? void : () => void
}) =>
  | undefined
  | void
  | Modified<Payload | PayloadPassed>
  | Promise<undefined | void | Modified<Payload | PayloadPassed>>

export type EventFnSuccess<
  TActionNameDefault extends ActionName = ActionName,
  PayloadPassed extends PlainObject | undefined | void = PlainObject
> = <Payload extends PlainObject | undefined | void, TActionName extends TActionNameDefault>(args: {
  payload: Modified<Payload | PayloadPassed>
  actionName: TActionName
  result: void | PlainObject | PlainObject[] | Modified<Payload | PayloadPassed>
  abort: TActionName extends 'stream' ? void : () => void
}) =>
  | void
  | PlainObject
  | PlainObject[]
  | Modified<Payload | PayloadPassed>
  | Promise<void | PlainObject | PlainObject[] | Modified<Payload | PayloadPassed>>

export type EventFnError<
  TActionNameDefault extends ActionName = ActionName,
  PayloadPassed extends PlainObject | undefined | void = PlainObject
> = <Payload extends PlainObject | undefined | void, TActionName extends TActionNameDefault>(args: {
  payload: Modified<Payload | PayloadPassed>
  actionName: TActionName
  error: VueSyncError
  abort: TActionName extends 'stream' ? void : () => void
}) =>
  | void
  | PlainObject
  | PlainObject[]
  | Modified<Payload | PayloadPassed>
  | Promise<void | PlainObject | PlainObject[] | Modified<Payload | PayloadPassed>>

export type EventFnRevert<
  TActionNameDefault extends ActionName = ActionName,
  PayloadPassed extends PlainObject | undefined | void = PlainObject
> = <Payload extends PlainObject | undefined | void, TActionName extends TActionNameDefault>(args: {
  payload: Payload
  actionName: TActionName
  result: void | PlainObject | PlainObject[] | Modified<Payload | PayloadPassed>
}) =>
  | void
  | PlainObject
  | PlainObject[]
  | Modified<Payload | PayloadPassed>
  | Promise<void | PlainObject | PlainObject[] | Modified<Payload | PayloadPassed>>

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
