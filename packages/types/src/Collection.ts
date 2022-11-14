import {
  MagnetarFetchAction,
  MagnetarStreamAction,
  MagnetarInsertAction,
  MagnetarDeleteAction,
  FetchMetaData,
} from './types/actions'
import { DocFn } from './Magnetar'
import { WhereFilterOp } from './types/clauses'
import { OPaths } from './types/utils/Paths'

export type CollectionInstance<
  DocDataType extends Record<string, any> = Record<string, any>,
  GranularTypes extends { insert: Record<string, any> } = { insert: DocDataType }
> = {
  /**
   * The cached data that was written or read so far
   */
  data: Map<string, DocDataType>
  /**
   * `doc` is available on every collection for chaining
   * @see {@link DocFn}
   * @example collection('pokedex').doc('001')
   */
  doc: DocFn<DocDataType>
  /**
   * The id of the collection. When this is a nested collection, it will not include the full path, only the final part
   * @example 'items'
   */
  id: string
  /**
   * The full path of the collection
   * @example 'pokedex/001/items'
   * @example 'pokedex'
   */
  path: string
  /**
   * Returns the open stream promise of this collection, dependant on which `where`/`limit`/`orderBy` filters was used.
   *
   * Returns `null` when there is no open stream.
   *
   * This promise will resolve when `collection().closeStream()` is called, or when the stream closed because of an error.
   */
  streaming: () => Promise<void> | null
  /**
   * Close the stream of this collection, dependant on which `where`/`limit`/`orderBy` filters was used.
   *
   * Does nothing if there is no open stream.
   */
  closeStream: () => void
  /**
   * Close all streams of this collection, no matter which `where`/`limit`/`orderBy` filters were used.
   *
   * Does nothing if there are no open streams.
   */
  closeAllStreams: () => void

  // actions
  /**
   * @see {@link MagnetarFetchAction}
   */
  fetch: MagnetarFetchAction<DocDataType, 'collection'>
  /**
   * @see {@link MagnetarStreamAction}
   */
  stream: MagnetarStreamAction<DocDataType>
  /**
   * @see {@link MagnetarInsertAction}
   */
  insert: MagnetarInsertAction<GranularTypes['insert']>
  /**
   * @see {@link MagnetarDeleteAction}
   */
  delete: MagnetarDeleteAction

  // filters
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  orderBy: (
    fieldPath: OPaths<DocDataType>,
    direction?: 'asc' | 'desc'
  ) => CollectionInstance<DocDataType, GranularTypes>
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  limit: (limitCount: number) => CollectionInstance<DocDataType, GranularTypes>
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  where: (
    fieldPath: OPaths<DocDataType>,
    operator: WhereFilterOp,
    value: any
  ) => CollectionInstance<DocDataType, GranularTypes>
  /**
   * Chainable filter. Returns {@link CollectionInstance} with filter applied.
   */
  startAfter(docSnapshot: Record<string, any>): CollectionInstance<DocDataType, GranularTypes>
  startAfter(...fieldValues: unknown[]): CollectionInstance<DocDataType, GranularTypes>
  /**
   * Meta data from the last fetch call
   */
  fetched: FetchMetaData
}
