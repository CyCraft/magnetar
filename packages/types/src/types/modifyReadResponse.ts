import { isPlainObject } from 'is-what'
import { DocMetadata } from './core.js'
import { PartialDeep } from './utils/PartialDeep.js'

/**
 * - `id` the current/new document's ID
 * - `current` is the reference pointer to the current document data
 * - `diffApplied` is the diff that was applied to the document, this will be a partial even if an insert call was made but there was existing data present already
 */
export type CacheStoreAddedResult<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = {
  id: string
  current: DocDataType
  diffApplied: Partial<DocDataType>
}

export function isCacheStoreAddedResult<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
>(result: unknown): result is CacheStoreAddedResult<DocDataType> {
  return (
    isPlainObject(result) &&
    !!result['id'] &&
    !!result['current'] &&
    !!result['diffApplied'] &&
    Object.keys(result).length === 3
  )
}

/**
 * Can be used to modify docs that come in from 'stream' or 'fetch' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
 */
export type OnAddedFn<DocDataType extends { [key: string]: any } = { [key: string]: any }> = (
  docData: PartialDeep<DocDataType>,
  docMetadata: DocMetadata,
) => CacheStoreAddedResult<DocDataType> | DocDataType | undefined

/**
 * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
 */
export type OnModifiedFn<DocDataType extends { [key: string]: any } = { [key: string]: any }> = (
  docData: PartialDeep<DocDataType>,
  docMetadata: DocMetadata,
) => PartialDeep<DocDataType> | undefined

/**
 * Is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. When returning `undefined` they will not be removed from the store data.
 */
export type OnRemovedFn = (
  docData: { [key: string]: any } | string | undefined,
  docMetadata: DocMetadata,
) => { [key: string]: any } | string | undefined

/**
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your cache data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export type ModifyReadResponseFnMap<
  DocDataType extends { [key: string]: any } = { [key: string]: any },
> = {
  /**
   * Can be used to modify docs that come in from 'stream' or 'fetch' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
   */
  added?: OnAddedFn<DocDataType>
  /**
   * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
   */
  modified?: OnModifiedFn<DocDataType>
  /**
   * Is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. When returning `undefined` they will not be removed from the store data.
   */
  removed?: OnRemovedFn
}

/**
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your cache data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export type ModifyReadResponseFnsMap = {
  added: OnAddedFn[]
  modified: OnModifiedFn[]
  removed: OnRemovedFn[]
}
