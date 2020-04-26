import { O } from 'ts-toolbelt';
import { VueSyncWriteAction, VueSyncGetAction, VueSyncStreamAction, VueSyncDeleteAction, VueSyncDeletePropAction, VueSyncInsertAction, OpenStreams } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { CollectionFn, DocFn } from './VueSync';
export declare type DocInstance<DocDataType extends object = {
    [prop: string]: any;
}> = {
    data: DocDataType;
    collection: CollectionFn;
    id: string;
    path: string;
    openStreams: OpenStreams;
    get?: VueSyncGetAction<DocDataType, 'doc'>;
    stream?: VueSyncStreamAction;
    insert?: VueSyncInsertAction<DocDataType>;
    merge?: VueSyncWriteAction<DocDataType>;
    assign?: VueSyncWriteAction<DocDataType>;
    replace?: VueSyncWriteAction<DocDataType>;
    deleteProp?: VueSyncDeletePropAction<DocDataType>;
    delete?: VueSyncDeleteAction<DocDataType>;
};
export declare function createDocWithContext<DocDataType extends object>([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn, openStreams: OpenStreams): DocInstance<DocDataType>;
