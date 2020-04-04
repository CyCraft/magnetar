import { ActionName, VueSyncError, ActionNameWrite } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import { PlainObject } from './base'

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore =
  | EventFnStreamBefore
  | EventFnGetBefore
  | EventFnDeleteBefore
  | EventFnWriteBefore

export type EventFnBeforeTernary<
  TActionName extends ActionName = ActionName
> = TActionName extends 'stream'
  ? EventFnStreamBefore
  : TActionName extends 'get'
  ? EventFnGetBefore
  : TActionName extends 'delete'
  ? EventFnDeleteBefore
  : EventFnWriteBefore

export type EventFnSuccess =
  | EventFnStreamSuccess
  | EventFnGetSuccess
  | EventFnDeleteSuccess
  | EventFnWriteSuccess

export type EventFnSuccessTernary<
  TActionName extends ActionName = ActionName
> = TActionName extends 'stream'
  ? EventFnStreamSuccess
  : TActionName extends 'get'
  ? EventFnGetSuccess
  : TActionName extends 'delete'
  ? EventFnDeleteSuccess
  : EventFnWriteSuccess

export type EventFnError =
  | EventFnStreamError
  | EventFnGetError
  | EventFnDeleteError
  | EventFnWriteError

export type EventFnErrorTernary<
  TActionName extends ActionName = ActionName
> = TActionName extends 'stream'
  ? EventFnStreamError
  : TActionName extends 'get'
  ? EventFnGetError
  : TActionName extends 'delete'
  ? EventFnDeleteError
  : EventFnWriteError

export type EventFnRevert = EventFnGetRevert | EventFnDeleteRevert | EventFnWriteRevert

export type EventFnRevertTernary<
  TActionName extends ActionName = ActionName
> = TActionName extends 'stream'
  ? never
  : TActionName extends 'get'
  ? EventFnGetRevert
  : TActionName extends 'delete'
  ? EventFnDeleteRevert
  : EventFnWriteRevert

export type EventFnWriteBefore = (args: {
  payload: PlainObject
  actionName: ActionNameWrite
  storeName: string
  abort: () => void
}) => void | PlainObject | Promise<void | PlainObject>

export type EventFnWriteSuccess = (args: {
  payload: PlainObject
  actionName: ActionNameWrite
  storeName: string
  result: void | PlainObject
  abort: () => void
}) => void | Promise<void>

export type EventFnWriteError = (args: {
  payload: PlainObject
  actionName: ActionNameWrite
  storeName: string
  error: VueSyncError
  abort: () => void
}) => void | Promise<void>

export type EventFnWriteRevert = (args: {
  payload: PlainObject
  actionName: ActionNameWrite
  storeName: string
  result: void | PlainObject
}) => void | Promise<void>

export type EventFnGetBefore = (args: {
  payload: PlainObject
  actionName: 'get'
  storeName: string
  abort: () => void
}) => void | PlainObject | Promise<void | PlainObject>

export type EventFnGetSuccess = (args: {
  payload: PlainObject | void
  actionName: 'get'
  storeName: string
  result: void | PlainObject | PlainObject[]
  abort: () => void
}) => void | Promise<void>

export type EventFnGetError = (args: {
  payload: PlainObject | void
  actionName: 'get'
  storeName: string
  error: VueSyncError
  abort: () => void
}) => void | Promise<void>

export type EventFnGetRevert = (args: {
  payload: void | PlainObject
  actionName: 'get'
  storeName: string
  result: void | PlainObject | PlainObject[]
}) => void | Promise<void>

export type EventFnStreamBefore = (args: {
  payload: void | PlainObject
  actionName: 'stream'
  storeName: string
  abort: void
}) => void | PlainObject | Promise<void | PlainObject>

export type EventFnStreamSuccess = (args: {
  payload: void | PlainObject
  actionName: 'stream'
  storeName: string
  result: void
  abort: void
}) => void | Promise<void>

export type EventFnStreamError = (args: {
  payload: void | PlainObject
  actionName: 'stream'
  storeName: string
  error: VueSyncError
  abort: void
}) => void | Promise<void>

export type EventFnDeleteBefore = (args: {
  payload: string | string[]
  actionName: 'delete'
  storeName: string
  abort: () => void
}) => void | string | string[] | Promise<void | string | string[]>

export type EventFnDeleteSuccess = (args: {
  payload: string | string[]
  actionName: 'delete'
  storeName: string
  result: void
  abort: () => void
}) => void | Promise<void>

export type EventFnDeleteError = (args: {
  payload: string | string[]
  actionName: 'delete'
  storeName: string
  error: VueSyncError
  abort: () => void
}) => void | Promise<void>

export type EventFnDeleteRevert = (args: {
  payload: string | string[]
  actionName: 'delete'
  storeName: string
  result: void
}) => void | Promise<void>

export type EventFn = EventFnBefore | EventFnSuccess | EventFnError | EventFnRevert

export type EventFnTernary<TEventName extends EventName = EventName> = TEventName extends 'before'
  ? EventFnBefore
  : TEventName extends 'success'
  ? EventFnSuccess
  : TEventName extends 'error'
  ? EventFnError
  : EventFnRevert

export type EventNameFnsMap<TActionName extends ActionName = ActionName> = {
  before: EventFnBeforeTernary<TActionName>[]
  success: EventFnSuccessTernary<TActionName>[]
  error: EventFnErrorTernary<TActionName>[]
  revert: EventFnRevertTernary<TActionName>[]
}

export function eventFnsMapWithDefaults<TActionName extends ActionName = ActionName> (
  eventNameFnsMap: Partial<EventNameFnsMap> = {}
): O.Compulsory<EventNameFnsMap<TActionName>> {
  return merge({ before: [], success: [], error: [], revert: [] }, eventNameFnsMap)
}
