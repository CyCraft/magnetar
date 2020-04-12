import { O } from 'ts-toolbelt';
import { SharedConfig } from './config';
import { PlainObject, StoreName } from './atoms';
import { DocInstance } from '../Doc';
import { CollectionInstance } from '../Collection';
/**
 * these are all the actions that Vue Sync streamlines, whichever plugin is used
 * these actions are executable from a `VueSyncModule` and handled by each plugin individually
 */
export declare type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete';
/**
 * this is what the dev can provide as second param when executing any action in addition to the payload
 */
export declare type ActionConfig = O.Merge<{
    executionOrder?: StoreName[];
}, Partial<O.Omit<SharedConfig, 'dataStoreName'>>>;
export declare type VueSyncStreamAction = (payload?: object | void, actionConfig?: ActionConfig) => Promise<void>;
export declare type VueSyncGetAction<DocDataType = PlainObject, calledFrom extends 'collection' | 'doc' = 'collection' | 'doc'> = (payload?: object | void, actionConfig?: ActionConfig) => Promise<calledFrom extends 'collection' ? CollectionInstance<DocDataType> : DocInstance<DocDataType>>;
export declare type VueSyncInsertAction<DocDataType = PlainObject> = (payload: object, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncWriteAction<DocDataType = PlainObject> = (payload: object, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncDeletePropAction<DocDataType = PlainObject> = (payload: string | string[], actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncDeleteAction<DocDataType = PlainObject> = (actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type VueSyncError = {
    payload: PlainObject | PlainObject[] | string | string[] | void;
    message: string;
    code?: number;
    errors?: VueSyncError[];
};
export declare function isVueSyncError(payload: any): payload is VueSyncError;
