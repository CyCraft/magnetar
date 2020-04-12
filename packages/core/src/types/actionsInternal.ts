import { PlainObject } from './atoms'
import { isAnyObject } from 'is-what'
import {
  VueSyncStreamAction,
  VueSyncGetAction,
  VueSyncDeleteAction,
  VueSyncDeletePropAction,
  VueSyncInsertAction,
  VueSyncWriteAction,
  ActionName,
} from './actions'

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

export type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? VueSyncStreamAction
  : TActionName extends 'get'
  ? VueSyncGetAction
  : TActionName extends 'delete'
  ? VueSyncDeleteAction
  : TActionName extends 'deleteProp'
  ? VueSyncDeletePropAction
  : TActionName extends 'insert'
  ? VueSyncInsertAction
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
