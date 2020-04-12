import { PlainObject } from './base';
import { O } from 'ts-toolbelt';
export declare type ModifyWritePayload = (payload: PlainObject) => PlainObject;
export declare type ModifyDeletePropPayload = (payload: string | string[]) => string | string[];
export declare type ModifyReadPayload = (payload: PlainObject | void) => PlainObject | void;
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
