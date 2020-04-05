import { PlainObject } from './base'

export type OnAddedFn = (payload: PlainObject, meta: PlainObject) => PlainObject | void
export type OnModifiedFn = (payload: PlainObject, meta: PlainObject) => PlainObject | void
export type OnRemovedFn = (
  payload: PlainObject | string,
  meta: PlainObject
) => PlainObject | string | void

export type ModifyReadResponseFnMap = {
  /**
   * 'modifyReadResponseOn.added' can modify documents that come in from 'stream' or get 'actions', before they are added to your store data.
   */
  added?: OnAddedFn
  /**
   * 'modifyReadResponseOn.modified' is triggered only while a 'stream' is open, and can modify documents that were modified on another client, before they are updated to your store data.
   */
  modified?: OnModifiedFn
  /**
   * 'modifyReadResponseOn.removed' is triggered only while a 'stream' is open, every time a document is either 'deleted' on another client OR if a document doesn't adhere to the clauses of that 'stream' anymore. Returning nothing will prevent the document from being removed from your store data.
   */
  removed?: OnRemovedFn
}

export type ModifyReadResponseFnsMap = {
  added: OnAddedFn[]
  modified: OnModifiedFn[]
  removed: OnRemovedFn[]
}

export function getModifyReadResponseFnsMap (
  ...onMaps: (ModifyReadResponseFnMap | void)[]
): ModifyReadResponseFnsMap {
  const _onMaps = onMaps.filter(Boolean) as ModifyReadResponseFnMap[]
  const result = {
    added: _onMaps.flatMap(on => on.added ?? []),
    modified: _onMaps.flatMap(on => on.modified ?? []),
    removed: _onMaps.flatMap(on => on.removed ?? []),
  }
  return result
}
