import { DocInstance } from '../Doc.js'
import { StoreName } from './core.js'
import { EventNameFnMap } from './events.js'
import { ModifyPayloadFnMap } from './modifyPayload.js'
import { ModifyReadResponseFnMap } from './modifyReadResponse.js'
import { PartialDeep } from './utils/PartialDeep.js'
import { OPathsWithOptional } from './utils/Paths.js'

/**
 * these are all the actions that Magnetar streamlines, whichever plugin is used
 * these actions are executable from a `MagnetarModule` and handled by each plugin individually
 */
export type ActionName = 'fetch' | 'fetchCount' | 'fetchSum' | 'fetchAverage' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete' // prettier-ignore

/**
 * You can pass options to this action specifically;
 * This is what the dev can provide as second param when executing any action in addition to the payload.
 * @example
 * // first update the server and await that before updating the local cache store:
 * { executionOrder: ['remote', 'cache'] }
 * @example
 * // don't throw errors for this action, wherever it might fail
 * { onError: 'continue' }
 */
export type ActionConfig<DocDataType extends { [key: string]: any } = { [key: string]: any }> = {
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
 * @param payload - Optional payload. For remote stores like Firestore, can include `onFirstData` callback to detect when initial snapshot arrives. It will be executed even on first Data OR on when it was determined there was no data on the server.
 * @example
 * // Basic stream
 * collection('pokedex').stream()
 * @example
 * // With onFirstData callback (Firestore plugins)
 * let isLoading = true
 * collection('pokedex').stream({ onFirstData: () => isLoading = false })
 * @example
 * // Insert initial doc
 * collection('pokedex').stream({ onFirstData: ({ empty }) => {
 *   if (empty) {
 *     collection('pokedex').insert({ name: 'Bulbasaur' })
 *   }
 * }})
 */
export type MagnetarStreamAction<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = (
  payload?:
    | { onFirstData?: (params: { empty?: boolean; existingStream?: boolean }) => void }
    | undefined,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>,
) => Promise<void>

/**
 * Fetches document(s) and adds the data to your local cache store's state.
 * Fetch is optimistic by default — if it can find the doc's data in your local cache state, it will return that and prevent any remote fetches.
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
  DocDataType extends { [key: string]: any } = { [key: string]: any },
  calledFrom extends 'collection' | 'doc' = 'collection' | 'doc',
> = (
  payload?: { force?: boolean } | { [key: string]: any } | undefined,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>,
) => Promise<calledFrom extends 'collection' ? Map<string, DocDataType> : DocDataType | undefined>

/**
 * Fetches a collection's document count and caches this count to your local cache store's state.
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
 * Fetches a collection's document sum for a the passed fieldPath and caches this sum to your local cache store's state.
 * @returns the document sum that was fetched.
 * @example
 * magnetar.collection('pokedex').sum // {}
 *
 * const sum = await magnetar.collection('pokedex').fetchSum('base.HP')
 * sum // 10_000
 * magnetar.collection('pokedex').sum // { base: { HP: 10_000 } }
 */
export type MagnetarFetchSumAction<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = (fieldPath: OPathsWithOptional<DocDataType>) => Promise<number>

/**
 * Fetches a collection's document average for a the passed fieldPath and caches this average to your local cache store's state.
 * @returns the document average that was fetched.
 * @example
 * magnetar.collection('pokedex').average // 0
 *
 * const average = await magnetar.collection('pokedex').fetchAverage('base.HP')
 * average // 88
 * magnetar.collection('pokedex').average // { base: { HP: 88 } }
 */
export type MagnetarFetchAverageAction<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = (fieldPath: OPathsWithOptional<DocDataType>) => Promise<number>

/**
 * @returns The new `doc()` instance after inserting. You can access the inserted `id` by checking this returned instance.
 * @example
 * const newDoc = collection('myDocs').insert({ some: 'payload' })
 * newDoc.id // the generated id
 * newDoc.data // { some: 'payload' }
 */
export type MagnetarInsertAction<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = (
  payload: DocDataType,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>,
) => Promise<DocInstance<DocDataType>>

/**
 * @returns the new document data after applying the changes to the cached document (including any modifications from modifyPayloadOn)
 */
export type MagnetarWriteAction<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = (
  payload: PartialDeep<DocDataType>,
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>,
) => Promise<DocDataType>

/**
 * @returns the new document data after applying the changes to the cached document (including any modifications from modifyPayloadOn)
 */
export type MagnetarDeletePropAction<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = (
  payload: keyof DocDataType | string | (keyof DocDataType | string)[],
  /**
   * TODO
   * @deprecated — should deprecated this "general" action config and replace with one specific for this action
   */
  actionConfig?: ActionConfig<DocDataType>,
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
  actionConfig?: ActionConfig,
) => Promise<void>

/**
 * All fetch promises with the payload passed to `fetch(payload)` as key (JSON.stringify) and the "fetch promise" as value. In case `fetch()` had no payload, use `undefined`
 */
export type FetchPromises = {
  [key in 'fetch' | 'fetchCount' | 'fetchSum' | 'fetchAverage']: Map<string, Promise<any>>
}

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
