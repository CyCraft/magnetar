import { EventFnBefore, EventFnSuccess, EventFnError, EventFnRevert } from './events'
import { O } from 'ts-toolbelt'
import { ModifyWritePayload, ModifyDeletePayload } from './modifyPayload'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

export type Modified<T> = T extends object ? O.Merge<Partial<T>, PlainObject> : T

// the shared config which can be set globally < per module < or per action.
export type SharedConfig = {
  executionOrder: {
    read?: StoreName[]
    write?: StoreName[]
    delete?: StoreName[]
    get?: StoreName[]
    stream?: StoreName[]
    insert?: StoreName[]
    merge?: StoreName[]
    assign?: StoreName[]
    replace?: StoreName[]
  }
  onError: 'stop' | 'continue' | 'revert'
  modifyPayloadOn: {
    insert?: ModifyWritePayload
    merge?: ModifyWritePayload
    assign?: ModifyWritePayload
    replace?: ModifyWritePayload
    write?: ModifyWritePayload
    delete?: ModifyDeletePayload
  }
  on: {
    before?: EventFnBefore
    success?: EventFnSuccess
    error?: EventFnError
    revert?: EventFnRevert
  }
}
