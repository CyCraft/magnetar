import { DocMetadata } from './core'
import { PartialDeep } from './utils/PartialDeep'

/**
 * Can be used to modify docs that come in from 'stream' or 'fetch' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
 */
export type OnAddedFn<DocDataType extends Record<string, any> = Record<string, any>> = (
  docData: PartialDeep<DocDataType>,
  docMetadata: DocMetadata
) => DocDataType | void

/**
 * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
 */
export type OnModifiedFn<DocDataType extends Record<string, any> = Record<string, any>> = (
  docData: PartialDeep<DocDataType>,
  docMetadata: DocMetadata
) => PartialDeep<DocDataType> | void

/**
 * Is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. When returning `undefined` they will not be removed from the store data.
 */
export type OnRemovedFn = (
  docData: Record<string, any> | string | undefined,
  docMetadata: DocMetadata
) => Record<string, any> | string | void

/**
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your local data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export type ModifyReadResponseFnMap<DocDataType extends Record<string, any> = Record<string, any>> =
  {
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
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your local data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export type ModifyReadResponseFnsMap = {
  added: OnAddedFn[]
  modified: OnModifiedFn[]
  removed: OnRemovedFn[]
}
