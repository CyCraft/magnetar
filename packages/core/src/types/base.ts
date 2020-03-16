import { ActionType, ActionName } from './actions'
import { EventFnBefore, EventFnSuccess, EventFnError, EventFnRevert } from './events'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

export type Modified<T> = PlainObject & Partial<T>

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
