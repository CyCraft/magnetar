import { DocInstance } from '../Doc'
import { StoreName } from './core'
import { EventNameFnMap } from './events'
import { ModifyPayloadFnMap } from './modifyPayload'
import { ModifyReadResponseFnMap } from './modifyReadResponse'
import { PartialDeep } from './utils/PartialDeep'

/**
 * these are all the actions that Magnetar streamlines, whichever plugin is used
 * these actions are executable from a `MagnetarModule` and handled by each plugin individually
 */
export type ActionName = 'fetch' | 'fetchCount' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete' // prettier-ignore

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
export type ActionConfig<DocDataType extends Record<string, any> = Record<string, any>> = {
  executionOrder?: StoreName[]
  onError?: 'revert' | 'continue' | 'stop'
  modifyPayloadOn?: ModifyPayloadFnMap<DocDataType>
  modifyReadResponseOn?: ModifyReadResponseFnMap<DocDataType>
  on?: EventNameFnMap
  /**
   * An option for remote stores like Firestore to delay a sync to the server and batch any additional actions made during the `syncDebounceMs`.
   */
  syncDebounceMs?: number
}

// these are the action types exposed to the dev via a MagnetarModule, it's what the dev will end up calling.

/**
 * Opens a continuous stream to a document or collection.
 * @returns the open stream promise. This will never resolve as long as the stream is open.
 */
export type MagnetarStreamAction<DocDataType extends Record<string, any> = Record<string, any>> = (
  payload?: any | void,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>
) => Promise<void>

/**
 * Fetches document(s) and adds the data to your local store's state.
 * Fetch is optimistic by default — if it can find the doc's data in your local state, it will return that and prevent any remote fetches.
 * You can force a re-fetch by passing `{ force: true }`
 * @returns the document(s) data that was fetched. If you need to access other metadata that was retrieved during fetching, you can use `modifyReadResponse.added`.
 * @example
 * const bulbasaur = magnetar.collection('pokedex').doc('001')
 * bulbasaur.fetch() // does nothing if already fetched once
 * @example
 * const bulbasaur = magnetar.collection('pokedex').doc('001')
 * bulbasaur.fetch({ force: true }) // makes API call to remote store
 * @example
 * const pokedex = magnetar.collection('pokedex')
 * pokedex.fetch() // does nothing if already fetched once
 * @example
 * const pokedex = magnetar.collection('pokedex')
 * pokedex.fetch({ force: true }) // makes API call to remote store
 */
export type MagnetarFetchAction<
  DocDataType extends Record<string, any> = Record<string, any>,
  calledFrom extends 'collection' | 'doc' = 'collection' | 'doc'
> = (
  payload?: { force?: boolean } | Record<string, any> | void,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>
) => Promise<calledFrom extends 'collection' ? Map<string, DocDataType> : DocDataType | undefined>

/**
 * Fetches a collection's document count and caches this count to your local store's state.
 * @returns the document count that was fetched.
 * @example
 * magnetar.collection('pokedex').count // 0
 *
 * const count = await magnetar.collection('pokedex').fetchCount()
 * count // 151
 * magnetar.collection('pokedex').count // 151
 */
export type MagnetarFetchCountAction = () => Promise<number>

/**
 * @returns The new `doc()` instance after inserting. You can access the inserted `id` by checking this returned instance.
 * @example
 * const newDoc = collection('myDocs').insert({ some: 'payload' })
 * newDoc.id // the generated id
 * newDoc.data // { some: 'payload' }
 */
export type MagnetarInsertAction<DocDataType extends Record<string, any> = Record<string, any>> = (
  payload: DocDataType,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>
) => Promise<DocInstance<DocDataType>>

/**
 * @returns the new document data after applying the changes to the local document (including any modifications from modifyPayloadOn)
 */
export type MagnetarWriteAction<DocDataType extends Record<string, any> = Record<string, any>> = (
  payload: PartialDeep<DocDataType>,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>
) => Promise<DocDataType>

/**
 * @returns the new document data after applying the changes to the local document (including any modifications from modifyPayloadOn)
 */
export type MagnetarDeletePropAction<
  DocDataType extends Record<string, any> = Record<string, any>
> = (
  payload: keyof DocDataType | string | (keyof DocDataType | string)[],
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>
) => Promise<Partial<DocDataType>>

/**
 * @param {*} [payload] When executing on a doc: no payload needed. When executing on a collection: you need to pass the document ID you want to delete.
 * @param {ActionConfig} [actionConfig]
 * @example collection('pokedex').delete('001')
 * @example doc('pokedex/001').delete()
 */
export type MagnetarDeleteAction = (
  payload?: any,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig
) => Promise<void>

/**
 * All fetch promises with the payload passed to `fetch(payload)` as key (JSON.stringify) and the "fetch promise" as value. In case `fetch()` had no payload, use `undefined`
 */
export type FetchPromises = Map<string, Promise<any>>

/**
 * Meta data on the last fetch call for a collection().
 * - easily fetch more data with:
 * ```js
 * dbMyCollection.startAfter(dbMyCollection.fetched.cursor).fetch()`
 * ```
 * - easily know if you fetched everything when using `startAfter` fetches:
 * ```js
 * if (dbMyCollection.fetched.reachedEnd) alert('fetched everything already')
 * ```
 */
export type FetchMetaDataCollection = {
  /** Wether or not the end was reached, in case there is no `limit` this is always true */
  reachedEnd: boolean
  /** The last fetched doc, in a format defined by the Plugin */
  cursor: unknown
}
