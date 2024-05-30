import {
  ActionName,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarFetchAction,
  MagnetarFetchCountAction,
  MagnetarInsertAction,
  MagnetarStreamAction,
  MagnetarWriteAction,
} from './actions'

/**
 * ActionType is only used as a shortcut to set the execution order in the global/module/action settings.
 */
export type ActionType = 'read' | 'write' | 'delete'

export type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream'
  ? MagnetarStreamAction
  : TActionName extends 'fetchCount'
  ? MagnetarFetchCountAction
  : TActionName extends 'fetch'
  ? MagnetarFetchAction
  : TActionName extends 'delete'
  ? MagnetarDeleteAction
  : TActionName extends 'deleteProp'
  ? MagnetarDeletePropAction
  : TActionName extends 'insert'
  ? MagnetarInsertAction
  : MagnetarWriteAction
