import {
  MagnetarWriteAction,
  MagnetarFetchAction,
  MagnetarStreamAction,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
} from './types/actions'
import { CollectionFn } from './Magnetar'

export type DocInstance<
  DocDataType extends Record<string, any> = Record<string, any>,
  GranularTypes extends { insert: Record<string, any> } = { insert: DocDataType }
> = {
  /**
   * The cached data that was written or read so far
   */
  data: DocDataType | undefined
  /**
   * `collection` is available on every document for chaining
   * @example doc('001').collection('items')
   */
  collection: CollectionFn
  /**
   * The id of the document. When this is a nested document, it will not include the full path, only the final part
   * @example '001'
   */
  id: string
  /**
   * The full path of the document
   * @example 'pokedex/001'
   */
  path: string
  /**
   * Meta data on the doc's existence
   * ```js
   * await magnetar.db('users/abc123').fetch() // this will update the `exists` metadata
   * console.log(`magnetar.db('users/abc123').exists → `, magnetar.db('users/abc123').exists)
   * ```
   * This way you can easily display in your UI if a document exists or not without having to manage that state yourself
   * - `undefined` at first
   * - `'error'` when fetched but the API call returned an error
   * - `false` when fetched once and the document does not exist
   * - `true` when successfully fetched
   */
  exists: undefined | 'error' | boolean
  /**
   * Returns the open stream promise of this doc.
   *
   * Returns `null` when there is no open stream.
   *
   * This promise will resolve when `doc().closeStream()` is called, or when the stream closed because of an error.
   */
  streaming: () => Promise<void> | null
  /**
   * Close the stream of this doc.
   *
   * Does nothing if there is no open stream.
   */
  closeStream: () => void

  // actions
  /**
   * @see {@link MagnetarFetchAction}
   */
  fetch: MagnetarFetchAction<DocDataType, 'doc'>
  /**
   * @see {@link MagnetarStreamAction}
   */
  stream: MagnetarStreamAction<DocDataType>
  /**
   * @see {@link MagnetarInsertAction}
   */
  insert: MagnetarInsertAction<GranularTypes['insert']>
  /**
   * @see {@link MagnetarWriteAction}
   */
  merge: MagnetarWriteAction<DocDataType>
  /**
   * @see {@link MagnetarWriteAction}
   */
  assign: MagnetarWriteAction<DocDataType>
  /**
   * @see {@link MagnetarWriteAction}
   */
  replace: MagnetarWriteAction<DocDataType>
  /**
   * @see {@link MagnetarDeletePropAction}
   */
  deleteProp: MagnetarDeletePropAction<DocDataType>
  /**
   * @see {@link MagnetarDeleteAction}
   */
  delete: MagnetarDeleteAction
}
