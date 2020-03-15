import { O } from 'ts-toolbelt'
import { VueSyncConfig } from '..'
import { ModuleConfig } from '../CreateModule'
import { getEventFnsPerStore } from '../getEventFnsPerStore'
import { ActionConfig, VueSyncGetAction } from '../types/actions'
import {
  PlainObject,
  OnRetrieveHandler,
  EventFnsPerStore,
  eventFnsMapWithDefaults,
} from '../types/base'
import { PluginModuleConfig } from '../types/plugins'

export function createGetHandler (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>
): VueSyncGetAction {
  // returns the action the dev can call on myModule.get()
  return function<T extends object> (
    payload?: T,
    actionConfig: ActionConfig = {}
  ): {
    onRetrieve: (arg: OnRetrieveHandler) => void
    retrieved: Promise<PlainObject[] | PlainObject>
  } {
    // create a collection to register handler functions to, either passed by the dev via onRetrieve or by a plugin for custom plugin logic
    const onRetrieveHandlers: OnRetrieveHandler[] = []

    // onRetrieve registers a handler in the array above to trigger at a later date
    const onRetrieve = (handler: OnRetrieveHandler): void => {
      onRetrieveHandlers.push(handler)
    }

    // get all the config needed to perform this action
    // const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError
    // const eventFnsPerStore: EventFnsPerStore = getEventFnsPerStore(
    //   globalConfig,
    //   moduleConfig,
    //   actionConfig
    // )
    const storesToExecute: string[] =
      actionConfig.executionOrder ||
      (moduleConfig.executionOrder || {})['get'] ||
      (moduleConfig.executionOrder || {})['read'] ||
      (globalConfig.executionOrder || {})['get'] ||
      (globalConfig.executionOrder || {})['read'] ||
      []
    if (storesToExecute.length === 0) {
      throw new Error('None of your store plugins have implemented this function.')
    }

    // this promise is to be resolved when all stores retrieved the data from their get() implementation
    const retrieveFn = async function (): Promise<PlainObject[] | PlainObject> {
      // handle and await each action in sequence
      let result: undefined | PlainObject[] | PlainObject = undefined
      for (const storeName of storesToExecute) {
        // find the action on the plugin
        const pluginAction = globalConfig.stores[storeName].actions['get']
        const pluginModuleConfig: PluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
        // const eventNameFnsMap = eventFnsMapWithDefaults(eventFnsPerStore[storeName])
        // the plugin action
        result = !pluginAction
          ? result
          : await pluginAction(onRetrieveHandlers, payload, pluginModuleConfig)
        // any time a plugin has resolved its result, trigger all the handlers
        for (const onRetrieveFn of onRetrieveHandlers) {
          onRetrieveFn(storeName, result)
        }
      }
      if (!result) return {}
      return result
    }

    return { onRetrieve, retrieved: retrieveFn() }
  }
}
