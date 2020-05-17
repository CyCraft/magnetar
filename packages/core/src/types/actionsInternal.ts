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
