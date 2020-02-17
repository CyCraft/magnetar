import { ActionType, ActionName, VueSyncError, VueSyncAction } from './actions'
import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

// events
export type EventName = 'before' | 'success' | 'error' | 'revert'

export type EventFnBefore = <T extends PlainObject>(args: {payload: T, actionName: ActionName, abort: () => void}) => Partial<T> | Promise<Partial<T>> // prettier-ignore
export type EventFnSuccess = <T extends PlainObject>(args: {payload: T, actionName: ActionName, abort: () => void}) => Partial<T> | Promise<Partial<T>> // prettier-ignore
export type EventFnError = <T extends PlainObject>(args: {payload: T, actionName: ActionName, abort: () => void, error: VueSyncError}) => Partial<T> | Promise<Partial<T>> // prettier-ignore
export type EventFnRevert = <T extends PlainObject>(args: {payload: T, actionName: ActionName}) => Partial<T> | Promise<Partial<T>> // prettier-ignore
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

// config
export interface Config {
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

// stores / plugins

export interface PluginInstance {
  actions: { [action in ActionName]?: VueSyncAction }
  revert: <T extends PlainObject>(payload: T, actionName: ActionName) => Promise<T> // prettier-ignore // the action that reverts other actions on error
  config: { [key: string]: any } // any other config the plugin needs
}
