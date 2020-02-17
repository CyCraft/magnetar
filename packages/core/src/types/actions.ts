import { PlainObject, Config } from './base'
import { isAnyObject } from 'is-what'

export type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign'

export type ActionType = 'read' | 'write'

export const actionNameTypeMap: { [action in ActionName]: ActionType } = {
  get: 'read',
  stream: 'read',
  insert: 'write',
  merge: 'write',
  assign: 'write',
}

export type ActionConfig = Partial<Config>

export type VueSyncReadAction = <T extends PlainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>> // prettier-ignore
export type VueSyncWriteAction = <T extends PlainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>> // prettier-ignore
export type VueSyncAction = VueSyncReadAction | VueSyncWriteAction

export type VueSyncError = {
  payload: PlainObject
  message: string
  code?: number
  errors?: VueSyncError[]
}

export function isVueSyncError (payload: any): payload is VueSyncError {
  return isAnyObject(payload) && 'payload' in payload && 'message' in payload
}
