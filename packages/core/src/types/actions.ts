import { PlainObject, SharedConfig } from './base'
import { isAnyObject } from 'is-what'

// these are all the actions that Vue Sync aims to streamline, whichever plugin is used
// these actions are executable from a `VueSyncModule` and handled by each plugin individually
export type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'delete'

// there are two action types for easier setting the execution order
export type ActionType = 'read' | 'write'

export const actionNameTypeMap: { [action in ActionName]: ActionType } = {
  get: 'read',
  stream: 'read',
  insert: 'write',
  merge: 'write',
  assign: 'write',
  replace: 'write',
  delete: 'write',
}

// this is what the dev can provide as second param when executing any action in addition to the payload
export type ActionConfig = Partial<SharedConfig>

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.
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
