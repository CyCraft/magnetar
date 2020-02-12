import { ActionType, ActionName } from './actions'

// atomic types
export type plainObject = { [key: string]: any }
export type StoreName = string

// events
export type EventName = 'before' | 'success' | 'error'
export type EventFn = <T extends plainObject>(args: {
  payload: T
  abort: () => void
  error?: any
}) => Partial<T> | Promise<Partial<T>>

// config
export interface Config {
  executionOrder?: {
    [actionType in ActionType]?: StoreName[]
  } &
    {
      [action in ActionName]?: StoreName[]
    }
  onError?: 'stop' | 'continue' | 'revert'
  on?: {
    [storeName: string]: {
      [key in EventName]?: EventFn
    } & {
      aborted?: <T extends plainObject>(
        args: { payload: T; error?: any } & { at: EventName }
      ) => Partial<T> | Promise<Partial<T>>
    }
  }
}
