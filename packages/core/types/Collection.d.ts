import { O } from 'ts-toolbelt';
import { VueSyncGetAction, VueSyncStreamAction, VueSyncInsertAction, OpenStreams } from './types/actions';
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
    /**
     * A WeakMap of all open streams with the payload passed to `stream(payload)` as key and the `unsubscribe` function as value. In case `stream()` had no payload, use `{}`
     * @type { WeakMap<object, () => void> }
     * @example
     * collection('myDocs').stream()
     * const unsubscribe = collection('myDocs').openStreams.get({})
     */
    openStreams: OpenStreams;
    get?: VueSyncGetAction<DocDataType, 'collection'>;
    stream?: VueSyncStreamAction;
    insert?: VueSyncInsertAction<DocDataType>;
    where: (fieldPath: string, operator: WhereFilterOp, value: any) => CollectionInstance<DocDataType>;
    orderBy: (fieldPath: string, direction?: 'asc' | 'desc') => CollectionInstance<DocDataType>;
    limit: (limitCount: number) => CollectionInstance<DocDataType>;
};
export declare function createCollectionWithContext<DocDataType extends object>(idOrPath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn<DocDataType>, openStreams: OpenStreams): CollectionInstance<DocDataType>;
