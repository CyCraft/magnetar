import { VueSyncStreamAction, VueSyncGetAction, VueSyncDeleteAction, VueSyncDeletePropAction, VueSyncInsertAction, VueSyncWriteAction, ActionName } from './actions';
/**
 * ActionType is only used as a shortcut to set the execution order in the global/module/action settings.
 */
export declare type ActionType = 'read' | 'write' | 'delete';
export declare const actionNameTypeMap: {
    [action in ActionName]: ActionType;
};
export declare type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream' ? VueSyncStreamAction : TActionName extends 'get' ? VueSyncGetAction : TActionName extends 'delete' ? VueSyncDeleteAction : TActionName extends 'deleteProp' ? VueSyncDeletePropAction : TActionName extends 'insert' ? VueSyncInsertAction : VueSyncWriteAction;
