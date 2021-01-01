import { O } from 'ts-toolbelt';
import { SharedConfig } from './config';
import { StoreName } from './atoms';
import { DocInstance } from '../Doc';
import { CollectionInstance } from '../Collection';
/**
 * these are all the actions that Vue Sync streamlines, whichever plugin is used
 * these actions are executable from a `MagnetarModule` and handled by each plugin individually
 */
export declare type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete';
/**
 * You can pass options to this action specifically;
 * This is what the dev can provide as second param when executing any action in addition to the payload.
 * @example
 * // first update the server and await that before updating the local store:
 * { executionOrder: ['remote', 'local'] }
 * @example
 * // don't throw errors for this action, wherever it might fail
 * { onError: 'continue' }
 */
export declare type ActionConfig = O.Patch<{
    executionOrder?: StoreName[];
}, Partial<O.Omit<SharedConfig, 'localStoreName' | 'executionOrder'>>>;
export declare type MagnetarStreamAction = (payload?: any | void, actionConfig?: ActionConfig) => Promise<void>;
export declare type MagnetarGetAction<DocDataType extends Record<string, any> = Record<string, any>, calledFrom extends 'collection' | 'doc' = 'collection' | 'doc'> = (payload?: Record<string, any> | void, actionConfig?: ActionConfig) => Promise<calledFrom extends 'collection' ? CollectionInstance<DocDataType> : DocInstance<DocDataType>>;
export declare type MagnetarInsertAction<DocDataType extends Record<string, any> = Record<string, any>> = (payload: DocDataType, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type MagnetarWriteAction<DocDataType extends Record<string, any> = Record<string, any>> = (payload: O.Optional<DocDataType, keyof DocDataType, 'deep'>, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
export declare type MagnetarDeletePropAction<DocDataType extends Record<string, any> = Record<string, any>> = (payload: keyof DocDataType | string | (keyof DocDataType | string)[], actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
/**
 * @param {*} [payload] When executing on a doc: no payload needed. When executing on a collection: you need to pass the document ID you want to delete.
 * @param {ActionConfig} [actionConfig]
 * @example collection('pokedex').delete('001')
 * @example doc('pokedex/001').delete()
 */
export declare type MagnetarDeleteAction<DocDataType extends Record<string, any> = Record<string, any>> = (payload?: any, actionConfig?: ActionConfig) => Promise<DocInstance<DocDataType>>;
/**
 * All open streams with the payload passed to `stream(payload)` as key and the "closeStream" function as value. In case `stream()` had no payload, use `undefined`
 * @example
 * collection('myDocs').stream()
 * const closeStream = collection('myDocs').openStreams.get(undefined)
 */
export declare type OpenStreams = Map<any, () => void>;
/**
 * A function that retrieves a stream's "closeStream" function based on a payload given
 * @example
 * collection('myDocs').stream({ some: 'payload' })
 * const closeStream = collection('myDocs').findStream({ some: 'payload' })
 */
export declare type FindStream = (streamPayload?: any) => (() => void) | undefined;
/**
 * All open stream promises with the payload passed to `stream(payload)` as key and the "streaming promise" as value. In case `stream()` had no payload, use `undefined`
 * @example
 * collection('myDocs').stream()
 * const closeStream = collection('myDocs').openStreams.get(undefined)
 */
export declare type OpenStreamPromises = Map<any, Promise<void>>;
/**
 * A function that retrieves a stream's "streaming promise" based on a payload given
 * @example
 * collection('myDocs').stream({ some: 'payload' })
 * const closeStream = collection('myDocs').findStream({ some: 'payload' })
 */
export declare type FindStreamPromise = (streamPayload?: any) => Promise<void> | undefined;
