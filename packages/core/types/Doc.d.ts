import { O } from 'ts-toolbelt';
import { VueSyncWriteAction, VueSyncGetAction, VueSyncStreamAction, VueSyncDeleteAction, VueSyncDeletePropAction, VueSyncInsertAction, OpenStreams } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { CollectionFn, DocFn } from './VueSync';
export declare type DocInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
    data: DocDataType;
    collection: CollectionFn;
    id: string;
    path: string;
    openStreams: OpenStreams;
    get: VueSyncGetAction<DocDataType, 'doc'>;
    stream: VueSyncStreamAction;
    insert: VueSyncInsertAction<DocDataType>;
    merge: VueSyncWriteAction<DocDataType>;
    assign: VueSyncWriteAction<DocDataType>;
    replace: VueSyncWriteAction<DocDataType>;
    deleteProp: VueSyncDeletePropAction<DocDataType>;
    /**
     * @type {VueSyncDeleteAction} Documentation copied from `VueSyncDeleteAction`
     * @param {*} [payload] The delete action doesn't need any payload. In some cases, a Store Plugin you use might accept a payload.
     * @param {ActionConfig} [actionConfig]
     * @example
     * // first update the server and await that before updating the local store:
     * doc(id).delete(undefined, { executionOrder: ['remote', 'local'] })
     */
    delete: VueSyncDeleteAction<DocDataType>;
};
export declare function createDocWithContext<DocDataType extends Record<string, any>>([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn, openStreams: OpenStreams): DocInstance<DocDataType>;
