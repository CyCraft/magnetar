import { O } from 'ts-toolbelt'
import { PlainObject } from './atoms'

export type ModifyWritePayload = (payload: PlainObject) => PlainObject
export type ModifyDeletePropPayload = (payload: string | string[]) => string | string[]
export type ModifyReadPayload = (payload: PlainObject | void) => PlainObject | void

export type ModifyPayloadFnMap = {
  insert?: ModifyWritePayload
  merge?: ModifyWritePayload
  assign?: ModifyWritePayload
  replace?: ModifyWritePayload
  write?: ModifyWritePayload
  deleteProp?: ModifyDeletePropPayload
  read?: ModifyReadPayload
  stream?: ModifyReadPayload
  get?: ModifyReadPayload
}

export type ModifyPayloadFnsMap = {
  insert: ModifyWritePayload[]
  merge: ModifyWritePayload[]
  assign: ModifyWritePayload[]
  replace: ModifyWritePayload[]
  write: ModifyWritePayload[]
  deleteProp: ModifyDeletePropPayload[]
  delete: never[]
  read: ModifyReadPayload[]
  stream: ModifyReadPayload[]
  get: ModifyReadPayload[]
}

export function getModifyPayloadFnsMap (
  ...onMaps: (ModifyPayloadFnMap | void)[]
): O.Omit<ModifyPayloadFnsMap, 'write' | 'read'> {
  const _onMaps = onMaps.filter(Boolean) as ModifyPayloadFnMap[]
  const writeFns = _onMaps.flatMap(on => on.write ?? [])
  const readFns = _onMaps.flatMap(on => on.read ?? [])
  // const deleteFns = _onMaps.flatMap(on => on.delete ?? [])
  const result = {
    insert: _onMaps.flatMap(on => on.insert ?? []).concat(writeFns),
    merge: _onMaps.flatMap(on => on.merge ?? []).concat(writeFns),
    assign: _onMaps.flatMap(on => on.assign ?? []).concat(writeFns),
    replace: _onMaps.flatMap(on => on.replace ?? []).concat(writeFns),
    deleteProp: _onMaps.flatMap(on => on.deleteProp ?? []),
    delete: [] as never[], // delete has no payload
    stream: _onMaps.flatMap(on => on.stream ?? []).concat(readFns),
    get: _onMaps.flatMap(on => on.get ?? []).concat(readFns),
  }
  return result
}
