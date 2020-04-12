import { O } from 'ts-toolbelt';
import { VueSyncWriteAction, VueSyncGetAction, VueSyncStreamAction, VueSyncDeleteAction, VueSyncDeletePropAction, VueSyncInsertAction } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { CollectionFn, DocFn } from './VueSync';
export declare type DocInstance<DocDataType = {
    [prop: string]: any;
}> = {
    data: DocDataType;
    collection: CollectionFn;
    id: string;
    path: string;
    openStreams: {
        [identifier: string]: () => void;
    };
    get?: VueSyncGetAction<DocDataType, 'doc'>;
    stream?: VueSyncStreamAction;
    insert?: VueSyncInsertAction<DocDataType>;
    merge?: VueSyncWriteAction<DocDataType>;
    assign?: VueSyncWriteAction<DocDataType>;
    replace?: VueSyncWriteAction<DocDataType>;
    deleteProp?: VueSyncDeletePropAction<DocDataType>;
    delete?: VueSyncDeleteAction<DocDataType>;
};
export declare function createDocWithContext<DocDataType>(idOrPath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn<DocDataType>): DocInstance<DocDataType>;
