import { DocMetadata } from './atoms'

/**
 * Can be used to modify docs that come in from 'stream' or 'fetch' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
 */
export type OnAddedFn = (docData: Record<string, any>, docMetadata: DocMetadata) => Record<string, any> | void //prettier-ignore

/**
 * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
 */
export type OnModifiedFn = (docData: Record<string, any>, docMetadata: DocMetadata) => Record<string, any> | void //prettier-ignore

/**
 * Is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. When returning `undefined` they will not be removed from the store data.
 */
export type OnRemovedFn = (docData: Record<string, any> | string, docMetadata: DocMetadata) => Record<string, any> | string | void //prettier-ignore

/**
 * These functions will be executed everytime BEFORE documents are added/modified/deleted in your local data store. The function defined will receive the payload with changes from the server. You can then modify and return this payload.
 */
export interface ModifyReadResponseFnMap {
  /**
   * Can be used to modify docs that come in from 'stream' or 'fetch' actions, before they are added to your store data. When returning `undefined` they will be discarded & won't be added to the store data.
   */
  added?: OnAddedFn
  /**
   * Is triggered only while a 'stream' is open, and can modify docs that were modified on another client, before they are updated to the store data. When returning `undefined` they will be discarded & the modifications won't be applied to the store data.
   */
  modified?: OnModifiedFn
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

export function getModifyReadResponseFnsMap(
  ...onMaps: (ModifyReadResponseFnMap | void)[]
): ModifyReadResponseFnsMap {
  const _onMaps = onMaps.filter(Boolean) as ModifyReadResponseFnMap[]
  const result = {
    added: _onMaps.flatMap((on) => on.added ?? []),
    modified: _onMaps.flatMap((on) => on.modified ?? []),
    removed: _onMaps.flatMap((on) => on.removed ?? []),
  }
  return result
}
