import { O } from 'ts-toolbelt';
import { VueSyncGetAction, VueSyncStreamAction, VueSyncInsertAction } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { DocFn, CollectionFn } from './VueSync';
import { WhereFilterOp } from './types/clauses';
export declare type CollectionInstance<DocDataType extends object = {
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
    where: (fieldPath: string, operator: WhereFilterOp, value: any) => CollectionInstance<DocDataType>;
};
export declare function createCollectionWithContext<DocDataType extends object>(idOrPath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn<DocDataType>): CollectionInstance<DocDataType>;
