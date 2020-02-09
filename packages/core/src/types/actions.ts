export type plainObject = { [key: string]: any }

export type ActionName = 'insert' | 'merge' | 'assign' | 'get' | 'stream'

export type ActionType = 'write' | 'read'

export const actionNameTypeMap: { [action in ActionName]: ActionType } = {
  insert: 'write',
  merge: 'write',
  assign: 'write',
  get: 'read',
  stream: 'read',
}

export type EventName = 'before' | 'success' | 'error'

// export interface EventParams<T> {}

export type EventFn = <T extends plainObject>(args: {
  payload: T
  abort: () => void
  error?: any
}) => Partial<T> | Promise<Partial<T>>

export interface ActionConfig {
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

export type PluginAction = <T extends plainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>> // prettier-ignore
