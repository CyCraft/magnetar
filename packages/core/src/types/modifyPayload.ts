import { merge } from 'merge-anything'
import { PlainObject } from './base'
import { ActionName } from './actions'
import { O } from 'ts-toolbelt'

export type ModifyWritePayload = (payload: PlainObject) => PlainObject
export type ModifyDeletePayload = (payload: string | string[]) => string | string[]

export type ModifyPayloadFnsMap = {
  insert: ModifyWritePayload[]
  merge: ModifyWritePayload[]
  assign: ModifyWritePayload[]
  replace: ModifyWritePayload[]
  write: ModifyWritePayload[]
  delete: ModifyDeletePayload[]
}

export function modifyPayloadFnsMapWithDefaults (
  modifyPayloadActionFnsMap: Partial<ModifyPayloadFnsMap> = {}
): ModifyPayloadFnsMap {
  return merge(
    {
      insert: [],
      merge: [],
      assign: [],
      replace: [],
      write: [],
      delete: [],
    },
    modifyPayloadActionFnsMap
  )
}

export function getModifyPayloadFnsMap (
  ...onMaps: ({
    insert?: ModifyWritePayload
    merge?: ModifyWritePayload
    assign?: ModifyWritePayload
    replace?: ModifyWritePayload
    write?: ModifyWritePayload
    delete?: ModifyDeletePayload
  } | void)[]
): O.Omit<ModifyPayloadFnsMap, 'write'> {
  const modifyPayloadFnsMap = modifyPayloadFnsMapWithDefaults()
  const result = onMaps.reduce((carry, onPerAction) => {
    if (!onPerAction) return carry
    Object.entries(onPerAction).forEach(
      ([eventName, eventFn]: [ActionName | 'write', ModifyWritePayload | ModifyDeletePayload]) => {
        if (eventName === 'write') {
          carry.insert.push(eventFn as ModifyWritePayload)
          carry.merge.push(eventFn as ModifyWritePayload)
          carry.assign.push(eventFn as ModifyWritePayload)
          carry.replace.push(eventFn as ModifyWritePayload)
        } else {
          carry[eventName].push(eventFn)
        }
      }
    )
    return carry
  }, modifyPayloadFnsMap)
  return result
}
