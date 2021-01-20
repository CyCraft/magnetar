import { O } from 'ts-toolbelt'

/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyWritePayload = (payload: Record<string, any>) => Record<string, any>
/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyDeletePropPayload = (payload: string | string[]) => string | string[]
/**
 * This function will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyReadPayload = (payload: Record<string, any> | void) => Record<string, any> | void

/**
 * These functions will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
export type ModifyPayloadFnMap = {
  insert?: ModifyWritePayload
  merge?: ModifyWritePayload
  assign?: ModifyWritePayload
  replace?: ModifyWritePayload
  write?: ModifyWritePayload
  deleteProp?: ModifyDeletePropPayload
  read?: ModifyReadPayload
  stream?: ModifyReadPayload
  fetch?: ModifyReadPayload
}

/**
 * These functions will be executed everytime BEFORE the related action is triggered. The function defined will receive the payload of the action. You can then modify and return this payload.
 */
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
  fetch: ModifyReadPayload[]
}

export function getModifyPayloadFnsMap(
  ...onMaps: (ModifyPayloadFnMap | void)[]
): O.Omit<ModifyPayloadFnsMap, 'write' | 'read'> {
  const _onMaps = onMaps.filter(Boolean) as ModifyPayloadFnMap[]
  const writeFns = _onMaps.flatMap((on) => on.write ?? [])
  const readFns = _onMaps.flatMap((on) => on.read ?? [])
  // const deleteFns = _onMaps.flatMap(on => on.delete ?? [])
  const result = {
    insert: _onMaps.flatMap((on) => on.insert ?? []).concat(writeFns),
    merge: _onMaps.flatMap((on) => on.merge ?? []).concat(writeFns),
    assign: _onMaps.flatMap((on) => on.assign ?? []).concat(writeFns),
    replace: _onMaps.flatMap((on) => on.replace ?? []).concat(writeFns),
    deleteProp: _onMaps.flatMap((on) => on.deleteProp ?? []),
    delete: [] as never[], // delete has no payload
    stream: _onMaps.flatMap((on) => on.stream ?? []).concat(readFns),
    fetch: _onMaps.flatMap((on) => on.fetch ?? []).concat(readFns),
  }
  return result
}
