import { PlainObject, SharedConfig, StoreName, Modified } from './base'
import { isAnyObject } from 'is-what'
import { O } from 'ts-toolbelt'

// these are all the actions that Vue Sync aims to streamline, whichever plugin is used
// these actions are executable from a `VueSyncModule` and handled by each plugin individually
export type ActionNameRead = 'get' | 'stream'
export type ActionNameWrite = 'insert' | 'merge' | 'assign' | 'replace' | 'delete'
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

export function isReadAction (actionName: ActionName): actionName is ActionNameRead {
  const actionType = actionNameTypeMap[actionName]
  return actionType === 'read'
}
export function isWriteAction (actionName: ActionName): actionName is ActionNameWrite {
  const actionType = actionNameTypeMap[actionName]
  return actionType === 'write'
}

// this is what the dev can provide as second param when executing any action in addition to the payload
export type ActionConfig = Partial<O.Overwrite<SharedConfig, { executionOrder: StoreName[] }>>

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.
// export type VueSyncStreamAction = <T extends object>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>> // prettier-ignore
export type VueSyncGetAction = <T extends object>(
                                  payload?: T,
                                  actionConfig?: ActionConfig
                                ) => Promise<PlainObject[] | PlainObject> // prettier-ignore
export type VueSyncWriteAction = <T extends object>(payload: T, actionConfig?: ActionConfig) => Promise<Modified<T>> // prettier-ignore

export type VueSyncError = {
  payload: PlainObject
  message: string
  code?: number
  errors?: VueSyncError[]
}

export function isVueSyncError (payload: any): payload is VueSyncError {
  return isAnyObject(payload) && 'payload' in payload && 'message' in payload
}
