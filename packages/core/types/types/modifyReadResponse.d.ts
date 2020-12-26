import { DocMetadata } from './atoms';
/**
 * Can be used to modify docs that come in from 'stream' or 'get' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
 */
export declare type OnAddedFn = (docData: Record<string, any>, docMetadata: DocMetadata) => Record<string, any> | void;
/**
 * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
 */
export declare type OnModifiedFn = (docData: Record<string, any>, docMetadata: DocMetadata) => Record<string, any> | void;
/**
 * Is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. When returning `undefined` they will not be removed from the store data.
 */
export declare type OnRemovedFn = (docData: Record<string, any> | string, docMetadata: DocMetadata) => Record<string, any> | string | void;
/**
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your local data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export interface ModifyReadResponseFnMap {
    /**
     * Can be used to modify docs that come in from 'stream' or 'get' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
     */
    added?: OnAddedFn;
    /**
     * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
     */
    modified?: OnModifiedFn;
    /**
     * Is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. When returning `undefined` they will not be removed from the store data.
     */
    removed?: OnRemovedFn;
}
/**
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your local data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export declare type ModifyReadResponseFnsMap = {
    added: OnAddedFn[];
    modified: OnModifiedFn[];
    removed: OnRemovedFn[];
};
export declare function getModifyReadResponseFnsMap(...onMaps: (ModifyReadResponseFnMap | void)[]): ModifyReadResponseFnsMap;
