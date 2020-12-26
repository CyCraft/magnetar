import { O } from 'ts-toolbelt';
import { MagnetarWriteAction, MagnetarGetAction, MagnetarStreamAction, MagnetarDeleteAction, MagnetarDeletePropAction, MagnetarInsertAction, OpenStreams, FindStream, OpenStreamPromises, FindStreamPromise } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { CollectionFn, DocFn } from './Magnetar';
export declare type DocInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
    /**
     * The cached data that was written or read so far
     */
    data: DocDataType;
    /**
     * `collection` is available on every document for chaining
     * @example doc('001').collection('items')
     */
    collection: CollectionFn;
    /**
     * The id of the document. When this is a nested document, it will not include the full path, only the final part
     * @example '001'
     */
    id: string;
    /**
     * The full path of the document
     * @example 'pokedex/001'
     */
    path: string;
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
    get: MagnetarGetAction<DocDataType, 'doc'>;
    stream: MagnetarStreamAction;
    insert: MagnetarInsertAction<DocDataType>;
    merge: MagnetarWriteAction<DocDataType>;
    assign: MagnetarWriteAction<DocDataType>;
    replace: MagnetarWriteAction<DocDataType>;
    deleteProp: MagnetarDeletePropAction<DocDataType>;
    /**
     * @type {MagnetarDeleteAction} Documentation copied from `MagnetarDeleteAction`
     * @param {*} [payload] The delete action doesn't need any payload. In some cases, a Store Plugin you use might accept a payload.
     * @param {ActionConfig} [actionConfig]
     */
    delete: MagnetarDeleteAction<DocDataType>;
};
export declare function createDocWithContext<DocDataType extends Record<string, any>>([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn, streams: {
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
}): DocInstance<DocDataType>;
