import { O } from 'ts-toolbelt';
/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export declare type ModifyWritePayload = (payload: Record<string, any>) => Record<string, any>;
/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export declare type ModifyDeletePropPayload = (payload: string | string[]) => string | string[];
/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export declare type ModifyReadPayload = (payload: Record<string, any> | void) => Record<string, any> | void;
/**
 * These functions will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export declare type ModifyPayloadFnMap = {
    insert?: ModifyWritePayload;
    merge?: ModifyWritePayload;
    assign?: ModifyWritePayload;
    replace?: ModifyWritePayload;
    write?: ModifyWritePayload;
    deleteProp?: ModifyDeletePropPayload;
    read?: ModifyReadPayload;
    stream?: ModifyReadPayload;
    fetch?: ModifyReadPayload;
};
/**
 * These functions will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export declare type ModifyPayloadFnsMap = {
    insert: ModifyWritePayload[];
    merge: ModifyWritePayload[];
    assign: ModifyWritePayload[];
    replace: ModifyWritePayload[];
    write: ModifyWritePayload[];
    deleteProp: ModifyDeletePropPayload[];
    delete: never[];
    read: ModifyReadPayload[];
    stream: ModifyReadPayload[];
    fetch: ModifyReadPayload[];
};
export declare function getModifyPayloadFnsMap(...onMaps: (ModifyPayloadFnMap | void)[]): O.Omit<ModifyPayloadFnsMap, 'write' | 'read'>;
