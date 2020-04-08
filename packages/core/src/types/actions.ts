import { PlainObject, StoreName, Modified, SharedConfig } from './base'
import { isAnyObject } from 'is-what'
import { O } from 'ts-toolbelt'
import { DocInstance } from '../Doc'

// these are all the actions that Vue Sync aims to streamline, whichever plugin is used
// these actions are executable from a `VueSyncModule` and handled by each plugin individually
export type ActionNameRead = 'get' | 'stream'
export type ActionNameWrite = 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp'
export type ActionNameDelete = 'delete'
export type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete' // prettier-ignore

/**
 * ActionType is only used as a shortcut to set the execution order in the global/module/action settings.
 */
export type ActionType = 'read' | 'write' | 'delete'

export const actionNameTypeMap: { [action in ActionName]: ActionType } = {
  get: 'read',
  stream: 'read',
  insert: 'write',
  merge: 'write',
  assign: 'write',
  replace: 'write',
  deleteProp: 'write',
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
export type ActionConfig = O.Merge<
  { executionOrder?: StoreName[] },
  Partial<O.Omit<SharedConfig, 'dataStoreName'>>
>

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.

export type VueSyncStreamAction = (payload?: object | void, actionConfig?: ActionConfig) => Promise<void> // prettier-ignore

export type VueSyncGetAction = (payload?: object | void, actionConfig?: ActionConfig) => Promise<PlainObject | PlainObject[] | void | undefined> // prettier-ignore

export type VueSyncInsertAction<DocDataType> = (payload: object, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>> // prettier-ignore

export type VueSyncWriteAction = (payload: object, actionConfig?: ActionConfig) => Promise<void> // prettier-ignore

export type VueSyncDeletePropAction = (payload: string | string[], actionConfig?: ActionConfig) => Promise<void> // prettier-ignore

export type VueSyncDeleteAction = (actionConfig?: ActionConfig) => Promise<void>

export type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? VueSyncStreamAction
  : TActionName extends 'get'
  ? VueSyncGetAction
  : TActionName extends 'delete'
  ? VueSyncDeleteAction
  : TActionName extends 'deleteProp'
  ? VueSyncDeletePropAction
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
