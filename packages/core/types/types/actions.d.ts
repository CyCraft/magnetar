import { PlainObject, SharedConfig } from './base';
export declare type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'delete';
export declare type ActionType = 'read' | 'write';
export declare const actionNameTypeMap: {
    [action in ActionName]: ActionType;
};
export declare type ActionConfig = Partial<SharedConfig>;
export declare type VueSyncReadAction = <T extends PlainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>>;
export declare type VueSyncWriteAction = <T extends PlainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>>;
export declare type VueSyncAction = VueSyncReadAction | VueSyncWriteAction;
export declare type VueSyncError = {
    payload: PlainObject;
    message: string;
    code?: number;
    errors?: VueSyncError[];
};
export declare function isVueSyncError(payload: any): payload is VueSyncError;
