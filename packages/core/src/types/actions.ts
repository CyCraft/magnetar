import { PlainObject, StoreName, Modified, SharedConfig } from './base'
import { isAnyObject } from 'is-what'
import { O } from 'ts-toolbelt'

// these are all the actions that Vue Sync aims to streamline, whichever plugin is used
// these actions are executable from a `VueSyncModule` and handled by each plugin individually
export type ActionNameRead = 'get' | 'stream'
export type ActionNameWrite = 'insert' | 'merge' | 'assign' | 'replace'
export type ActionNameDelete = 'delete'
export type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'delete'

// there are two action types for easier setting the execution order
export type ActionType = 'read' | 'write' | 'delete'

export const actionNameTypeMap: { [action in ActionName]: ActionType } = {
  get: 'read',
  stream: 'read',
  insert: 'write',
  merge: 'write',
  assign: 'write',
  replace: 'write',
  delete: 'delete',
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
export type ActionConfig = O.Merge<{ executionOrder?: StoreName[] }, Partial<SharedConfig>>

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.
export type VueSyncStreamAction = <Payload extends object>(payload?: Payload, actionConfig?: ActionConfig) => Promise<void> // prettier-ignore

export type VueSyncGetAction = <Payload extends void | object>(
  payload?: Payload,
  actionConfig?: ActionConfig
) => Promise<PlainObject | PlainObject[] | void | undefined>

export type VueSyncWriteAction = <Payload extends object | object[]>(payload: Payload, actionConfig?: ActionConfig) => Promise<Modified<Payload>> // prettier-ignore

export type VueSyncDeleteAction = (payload: object | object[] | string | string[], actionConfig?: ActionConfig) => Promise<void> // prettier-ignore

export type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? VueSyncStreamAction
  : TActionName extends 'get'
  ? VueSyncGetAction
  : TActionName extends 'delete'
  ? VueSyncDeleteAction
  : VueSyncWriteAction

export type VueSyncError = {
  payload: PlainObject | PlainObject[] | string | string[] | void
  message: string
  code?: number
  errors?: VueSyncError[]
}

export function isVueSyncError (payload: any): payload is VueSyncError {
  return isAnyObject(payload) && 'payload' in payload && 'message' in payload
}
