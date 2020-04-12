import { O } from 'ts-toolbelt';
import { VueSyncGetAction, VueSyncStreamAction, VueSyncInsertAction } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { DocFn, CollectionFn } from './VueSync';
export declare type CollectionInstance<DocDataType = {
    [prop: string]: any;
}> = {
    data: Map<string, DocDataType>;
    doc: DocFn<DocDataType>;
    id: string;
    path: string;
    openStreams: {
        [identifier: string]: () => void;
    };
    get?: VueSyncGetAction<DocDataType, 'collection'>;
    stream?: VueSyncStreamAction;
    insert?: VueSyncInsertAction<DocDataType>;
};
export declare function createCollectionWithContext<DocDataType>(idOrPath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn<DocDataType>): CollectionInstance<DocDataType>;
