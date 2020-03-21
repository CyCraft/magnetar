import { ActionType, ActionName } from './actions'
import { EventFnBefore, EventFnSuccess, EventFnError, EventFnRevert } from './events'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

export type Modified<T> = PlainObject & Partial<T>

// the shared config which can be set globally < per module < or per action.
export type SharedConfig<TActionName extends ActionName = ActionName> = {
  executionOrder: {
    [actionType in ActionType]?: StoreName[]
  } &
    {
      [action in ActionName]?: StoreName[]
    }
  onError: 'stop' | 'continue' | 'revert'
  on: {
    [storeName: string]: {
      before?: EventFnBefore<TActionName>
      success?: EventFnSuccess<TActionName>
      error?: EventFnError<TActionName>
      revert?: EventFnRevert<TActionName>
    }
  }
}
// export interface SharedConfig {
//   executionOrder: {
//     [actionType in ActionType]?: StoreName[]
//   } &
//     {
//       [action in ActionName]?: StoreName[]
//     }
//   onError: 'stop' | 'continue' | 'revert'
//   on: {
//     [storeName: string]: {
//       before?: EventFnBefore<ActionName>
//       success?: EventFnSuccess
//       error?: EventFnError
//       revert?: EventFnRevert
//     }
//   }
// }
