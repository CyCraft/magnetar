import { O } from 'ts-toolbelt';
import { MagnetarGetAction, MagnetarStreamAction, MagnetarInsertAction, OpenStreams, FindStream, OpenStreamPromises, FindStreamPromise } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { DocFn, CollectionFn } from './Magnetar';
import { WhereFilterOp } from './types/clauses';
export declare type CollectionInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
    data: Map<string, DocDataType>;
    doc: DocFn<DocDataType>;
    id: string;
    path: string;
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
    get: MagnetarGetAction<DocDataType, 'collection'>;
    stream: MagnetarStreamAction;
    insert: MagnetarInsertAction<DocDataType>;
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
