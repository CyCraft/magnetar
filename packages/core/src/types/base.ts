import { ActionType, ActionName, VueSyncError } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

export type Modified<T> = PlainObject & Partial<T>

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore = <T extends object>(args: {payload: T, actionName: ActionName, abort: () => void}) => Modified<T> | Promise<Modified<T>> // prettier-ignore
export type EventFnSuccess = <T extends object>(args: {payload: T, actionName: ActionName, abort: () => void}) => Modified<T> | Promise<Modified<T>> // prettier-ignore
export type EventFnError = <T extends object>(args: {payload: T, actionName: ActionName, abort: () => void, error: VueSyncError}) => Modified<T> | Promise<Modified<T>> // prettier-ignore
export type EventFnRevert = <T extends object>(args: {payload: T, actionName: ActionName}) => Modified<T> | Promise<Modified<T>> // prettier-ignore
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

// the shared config which can be set globally < per module < or per action.
export interface SharedConfig {
  executionOrder: {
    [actionType in ActionType]?: StoreName[]
  } &
    {
      [action in ActionName]?: StoreName[]
    }
  onError: 'stop' | 'continue' | 'revert'
  on: {
    [storeName: string]: {
      before?: EventFnBefore
      success?: EventFnSuccess
      error?: EventFnError
      revert?: EventFnRevert
    }
  }
}

export type OnRetrieveHandler = (storeName: string, data: PlainObject[] | PlainObject) => void
