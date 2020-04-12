import { PlainObject, StoreName, SharedConfig } from './base';
import { O } from 'ts-toolbelt';
import { DocInstance } from '../Doc';
import { CollectionInstance } from '../Collection';
export declare type ActionNameRead = 'get' | 'stream';
export declare type ActionNameWrite = 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp';
export declare type ActionNameDelete = 'delete';
export declare type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete';
/**
 * ActionType is only used as a shortcut to set the execution order in the global/module/action settings.
 */
export declare type ActionType = 'read' | 'write' | 'delete';
export declare const actionNameTypeMap: {
    [action in ActionName]: ActionType;
};
export declare function isReadAction(actionName: ActionName): actionName is ActionNameRead;
export declare function isWriteAction(actionName: ActionName): actionName is ActionNameWrite;
export declare type ActionConfig = O.Merge<{
    executionOrder?: StoreName[];
}, Partial<O.Omit<SharedConfig, 'dataStoreName'>>>;
export declare type VueSyncStreamAction = (payload?: object | void, actionConfig?: ActionConfig) => Promise<void>;
export declare type VueSyncGetAction<DocDataType = PlainObject, calledFrom extends 'collection' | 'doc' = 'collection' | 'doc'> = (payload?: object | void, actionConfig?: ActionConfig) => Promise<calledFrom extends 'collection' ? CollectionInstance<DocDataType> : DocInstance<DocDataType>>;
export declare type VueSyncInsertAction<DocDataType = PlainObject> = (payload: object, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncWriteAction<DocDataType = PlainObject> = (payload: object, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncDeletePropAction<DocDataType = PlainObject> = (payload: string | string[], actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncDeleteAction<DocDataType = PlainObject> = (actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type ActionTernary<TActionName extends ActionName> = TActionName extends 'stream' ? VueSyncStreamAction : TActionName extends 'get' ? VueSyncGetAction : TActionName extends 'delete' ? VueSyncDeleteAction : TActionName extends 'deleteProp' ? VueSyncDeletePropAction : TActionName extends 'insert' ? VueSyncInsertAction : VueSyncWriteAction;
export declare type VueSyncError = {
    payload: PlainObject | PlainObject[] | string | string[] | void;
    message: string;
    code?: number;
    errors?: VueSyncError[];
};
export declare function isVueSyncError(payload: any): payload is VueSyncError;
