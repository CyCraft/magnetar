import { O } from 'ts-toolbelt'
import { EventNameFnMap } from './events'
import { ModifyPayloadFnMap } from './modifyPayload'
import { ModifyReadResponseFnMap } from './modifyReadResponse'

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
  modifyPayloadOn: ModifyPayloadFnMap
  modifyReadResponseOn: ModifyReadResponseFnMap
  on: EventNameFnMap
  /**
   * the storeName of the plugin that will keep your local data cache for usage with your client.
   */
  dataStoreName: StoreName
}
