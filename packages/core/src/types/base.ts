import { O } from 'ts-toolbelt'
import { ModifyPayloadFnMap } from './modifyPayload'
import { ModifyReadResponseFnMap } from './modifyReadResponse'
import { EventNameFnMap } from './events'
import { PluginInstance } from './plugins'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

export type DocMetadata = { data: PlainObject; id: string; exists: boolean; metadata?: PlainObject }

/**
 * Shared config can be set globally < or per module < or per action.
 */
export type SharedConfig = {
  executionOrder: {
    read?: StoreName[]
    write?: StoreName[]
    delete?: StoreName[]
    deleteProp?: StoreName[]
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

/**
 * The VueSync global options. Can be overwritten on a per-module or per-action basis.
 */
export type GlobalConfig = O.Merge<
  O.Compulsory<Partial<SharedConfig>, 'dataStoreName'>,
  { stores: { [storeName: string]: PluginInstance } }
>

/**
 * Extra options the dev can pass when creating a module with collection() or doc(). These will take precedence over the global config.
 */
export type ModuleConfig = O.Merge<
  Partial<SharedConfig>,
  {
    /**
     * Custom config the dev can set per Store Plugin. This will be passed to the plugin's action handler.
     */
    configPerStore?: {
      [storeName: string]: PlainObject
    }
  }
>
