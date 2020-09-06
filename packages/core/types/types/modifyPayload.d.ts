import { O } from 'ts-toolbelt';
export declare type ModifyWritePayload = (payload: Record<string, any>) => Record<string, any>;
export declare type ModifyDeletePropPayload = (payload: string | string[]) => string | string[];
export declare type ModifyReadPayload = (payload: Record<string, any> | void) => Record<string, any> | void;
export declare type ModifyPayloadFnMap = {
    insert?: ModifyWritePayload;
    merge?: ModifyWritePayload;
    assign?: ModifyWritePayload;
    replace?: ModifyWritePayload;
    write?: ModifyWritePayload;
    deleteProp?: ModifyDeletePropPayload;
    read?: ModifyReadPayload;
    stream?: ModifyReadPayload;
    get?: ModifyReadPayload;
};
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
    get: ModifyReadPayload[];
};
export declare function getModifyPayloadFnsMap(...onMaps: (ModifyPayloadFnMap | void)[]): O.Omit<ModifyPayloadFnsMap, 'write' | 'read'>;
