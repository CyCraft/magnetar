import { PlainObject, StoreName, Modified } from './base'
import { isAnyObject } from 'is-what'
import { ModifyWritePayload, ModifyDeletePayload } from './modifyPayload'
import { EventFnBefore, EventFnSuccess, EventFnError, EventFnRevert } from './events'

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
export type ActionConfig<TActionName extends ActionName = ActionName> = {
  executionOrder?: StoreName[]
  onError?: 'stop' | 'continue' | 'revert'
  modifyPayloadOn?: {
    insert?: ModifyWritePayload
    merge?: ModifyWritePayload
    assign?: ModifyWritePayload
    replace?: ModifyWritePayload
    write?: ModifyWritePayload
    delete?: ModifyDeletePayload
  }
  on?: {
    before?: EventFnBefore
    success?: EventFnSuccess
    error?: EventFnError
    revert?: EventFnRevert
  }
}

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.
export type VueSyncStreamAction = <Payload extends object>(payload?: Payload, actionConfig?: ActionConfig<'stream'>) => Promise<void> // prettier-ignore

export type VueSyncGetAction = <Payload extends void | object>(
  payload?: Payload,
  actionConfig?: ActionConfig<'get'>
) => Promise<PlainObject | PlainObject[] | void | undefined>

export type VueSyncWriteAction = <Payload extends object>(payload: Payload, actionConfig?: ActionConfig<ActionNameWrite>) => Promise<Modified<Payload>> // prettier-ignore

export type VueSyncDeleteAction = (ids: string | string[], actionConfig?: ActionConfig<'delete'>) => Promise<void> // prettier-ignore

export type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? VueSyncStreamAction
  : TActionName extends 'get'
  ? VueSyncGetAction
  : TActionName extends 'delete'
  ? VueSyncDeleteAction
  : VueSyncWriteAction

export type VueSyncError = {
  payload: PlainObject
  message: string
  code?: number
  errors?: VueSyncError[]
}

export function isVueSyncError (payload: any): payload is VueSyncError {
  return isAnyObject(payload) && 'payload' in payload && 'message' in payload
}
