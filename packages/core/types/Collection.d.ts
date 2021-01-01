import { O } from 'ts-toolbelt';
import { MagnetarGetAction, MagnetarStreamAction, MagnetarInsertAction, OpenStreams, FindStream, OpenStreamPromises, FindStreamPromise, MagnetarDeleteAction } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { DocFn, CollectionFn } from './Magnetar';
import { WhereFilterOp } from './types/clauses';
export declare type CollectionInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
    /**
     * The cached data that was written or read so far
     */
    data: Map<string, DocDataType>;
    /**
     * `doc` is available on every collection for chaining
     * @example collection('pokedex').doc('001')
     */
    doc: DocFn<DocDataType>;
    /**
     * The id of the collection. When this is a nested collection, it will not include the full path, only the final part
     * @example 'items'
     */
    id: string;
    /**
     * The full path of the collection
     * @example 'pokedex/001/items'
     * @example 'pokedex'
     */
    path: string;
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
    get: MagnetarGetAction<DocDataType, 'collection'>;
    stream: MagnetarStreamAction;
    insert: MagnetarInsertAction<DocDataType>;
    delete: MagnetarDeleteAction<DocDataType>;
    where: (fieldPath: string, operator: WhereFilterOp, value: any) => CollectionInstance<DocDataType>;
    orderBy: (fieldPath: string, direction?: 'asc' | 'desc') => CollectionInstance<DocDataType>;
    limit: (limitCount: number) => CollectionInstance<DocDataType>;
};
export declare function createCollectionWithContext<DocDataType extends Record<string, any>>([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn<DocDataType>, streams: {
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
}): CollectionInstance<DocDataType>;
