import { O } from 'ts-toolbelt';
import { MagnetarWriteAction, MagnetarGetAction, MagnetarStreamAction, MagnetarDeleteAction, MagnetarDeletePropAction, MagnetarInsertAction, OpenStreams, FindStream, OpenStreamPromises, FindStreamPromise } from './types/actions';
import { ModuleConfig, GlobalConfig } from './types/config';
import { CollectionFn, DocFn } from './Magnetar';
export declare type DocInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
    data: DocDataType;
    collection: CollectionFn;
    id: string;
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
     * @example
     * // first update the server and await that before updating the local store:
     * doc(id).delete(undefined, { executionOrder: ['remote', 'local'] })
     */
    delete: MagnetarDeleteAction<DocDataType>;
};
export declare function createDocWithContext<DocDataType extends Record<string, any>>([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, docFn: DocFn<DocDataType>, collectionFn: CollectionFn, streams: {
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
}): DocInstance<DocDataType>;
