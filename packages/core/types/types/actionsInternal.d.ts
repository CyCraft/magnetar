import { MagnetarStreamAction, MagnetarGetAction, MagnetarDeleteAction, MagnetarDeletePropAction, MagnetarInsertAction, MagnetarWriteAction, ActionName } from './actions';
/**
 * ActionType is only used as a shortcut to set the execution order in the global/module/action settings.
 */
export declare type ActionType = 'read' | 'write' | 'delete';
export declare const actionNameTypeMap: {
    [action in ActionName]: ActionType;
};
export declare type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream' ? MagnetarStreamAction : TActionName extends 'get' ? MagnetarGetAction : TActionName extends 'delete' ? MagnetarDeleteAction : TActionName extends 'deleteProp' ? MagnetarDeletePropAction : TActionName extends 'insert' ? MagnetarInsertAction : MagnetarWriteAction;
