import { O } from 'ts-toolbelt'
import { SharedConfig } from './config'
import { StoreName } from './atoms'
import { DocInstance } from '../Doc'

/**
 * these are all the actions that Magnetar streamlines, whichever plugin is used
 * these actions are executable from a `MagnetarModule` and handled by each plugin individually
 */
export type ActionName = 'fetch' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete' // prettier-ignore

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
export type ActionConfig = O.Patch<
  { executionOrder?: StoreName[] },
  Partial<O.Omit<SharedConfig, 'localStoreName' | 'executionOrder'>>
>

// these are the action types exposed to the dev via a MagnetarModule, it's what the dev will end up calling.

/**
 * Opens a continuous stream to a document or collection.
 * @returns the open stream promise. This will never resolve as long as the stream is open.
 */
export type MagnetarStreamAction = (
  payload?: any | void,
  actionConfig?: ActionConfig
) => Promise<void>

/**
 * Fetches document(s) and adds the data to your local store's state.
 * @returns the document(s) data that was fetched. If you need to access other metadata that was retrieved during fetching, you can use `modifyReadResponse.added`.
 */
export type MagnetarFetchAction<
  DocDataType extends Record<string, any> = Record<string, any>,
  calledFrom extends 'collection' | 'doc' = 'collection' | 'doc'
> = (
  payload?: { ifUnfetched?: boolean } | Record<string, any> | void,
  actionConfig?: ActionConfig
) => Promise<calledFrom extends 'collection' ? Map<string, DocDataType> : DocDataType>

/**
 * @returns The new `doc()` instance after inserting. You can access the inserted `id` by checking this returned instance.
 * @example
 * const newDoc = collection('myDocs').insert({ some: 'payload' })
 * newDoc.id // the generated id
 * newDoc.data // { some: 'payload' }
 */
export type MagnetarInsertAction<DocDataType extends Record<string, any> = Record<string, any>> = (
  payload: DocDataType,
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

/**
 * @returns the new document data after applying the changes to the local document (including any modifications from modifyPayloadOn)
 */
export type MagnetarWriteAction<DocDataType extends Record<string, any> = Record<string, any>> = (
  payload: O.Optional<DocDataType, keyof DocDataType, 'deep'>,
  actionConfig?: ActionConfig
) => Promise<DocDataType>

/**
 * @returns the new document data after applying the changes to the local document (including any modifications from modifyPayloadOn)
 */
export type MagnetarDeletePropAction<
  DocDataType extends Record<string, any> = Record<string, any>
> = (
  payload: keyof DocDataType | string | (keyof DocDataType | string)[],
  actionConfig?: ActionConfig
) => Promise<Partial<DocDataType>>

/**
 * @param {*} [payload] When executing on a doc: no payload needed. When executing on a collection: you need to pass the document ID you want to delete.
 * @param {ActionConfig} [actionConfig]
 * @example collection('pokedex').delete('001')
 * @example doc('pokedex/001').delete()
 */
export type MagnetarDeleteAction = (payload?: any, actionConfig?: ActionConfig) => Promise<void>

/**
 * All open streams with the payload passed to `stream(payload)` as key and the "closeStream" function as value. In case `stream()` had no payload, use `undefined`
 * @example
 * collection('myDocs').stream()
 * const closeStream = collection('myDocs').openStreams.get(undefined)
 */
export type OpenStreams = Map<any, () => void>

/**
 * A function that retrieves a stream's "closeStream" function based on a payload given
 * @example
 * collection('myDocs').stream({ some: 'payload' })
 * const closeStream = collection('myDocs').findStream({ some: 'payload' })
 */
export type FindStream = (streamPayload?: any) => (() => void) | undefined

/**
 * All open stream promises with the payload passed to `stream(payload)` as key and the "streaming promise" as value. In case `stream()` had no payload, use `undefined`
 * @example
 * collection('myDocs').stream()
 * const closeStream = collection('myDocs').openStreams.get(undefined)
 */
export type OpenStreamPromises = Map<any, Promise<void>>

/**
 * A function that retrieves a stream's "streaming promise" based on a payload given
 * @example
 * collection('myDocs').stream({ some: 'payload' })
 * const closeStream = collection('myDocs').findStream({ some: 'payload' })
 */
export type FindStreamPromise = (streamPayload?: any) => Promise<void> | undefined

/**
 * All fetch promises with the payload passed to `fetch(payload)` as key (JSON.stringify) and the "fetch promise" as value. In case `fetch()` had no payload, use `undefined`
 */
export type FetchPromises = Map<string, Promise<any>>
