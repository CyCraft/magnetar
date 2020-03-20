import { O } from 'ts-toolbelt'
import { VueSyncConfig } from '..'
import { ModuleConfig } from '../CreateModule'
import { getEventFnsPerStore } from '../getEventFnsPerStore'
import { handleAction } from './handleAction'
import { EventFnsPerStore, eventFnsMapWithDefaults } from '../types/events'
import { ActionType, ActionConfig, VueSyncStreamAction } from '../types/actions'
import { PluginModuleConfig, OnNextStoresStream } from '../types/plugins'

export function handleStreamPerStore (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>,
  actionType: ActionType
): VueSyncStreamAction {
  // returns the action the dev can call with myModule.insert() etc.
  return function<T extends object> (payload: T, actionConfig: ActionConfig = {}): Promise<void> {
    // get all the config needed to perform this action
    const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError
    const eventFnsPerStore: EventFnsPerStore = getEventFnsPerStore(
      globalConfig,
      moduleConfig,
      actionConfig
    )
    const storesToExecute: string[] =
      actionConfig.executionOrder ||
      (moduleConfig.executionOrder || {})['stream'] ||
      (moduleConfig.executionOrder || {})[actionType] ||
      (globalConfig.executionOrder || {})['stream'] ||
      (globalConfig.executionOrder || {})[actionType] ||
      []
    if (storesToExecute.length === 0) {
      throw new Error('None of your store plugins have implemented this function.')
    }

    // a mutatable array of successevents which is to be triggered each time a next store triggers a successevent
    const onNextStoresStream: OnNextStoresStream = {
      inserted: [],
      merged: [],
      assigned: [],
      replaced: [],
      deleted: [],
    }

    const streamPromisePerStore: { [storeName: string]: Promise<void> } = {}

    function stopExecutionAfterAction (): void {
      throw new Error('Manually aborted')
    }

    // handle and await each action in sequence
    for (const storeName of storesToExecute) {
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName].actions['stream']
      const pluginModuleConfig: PluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
      const eventNameFnsMap = eventFnsMapWithDefaults(eventFnsPerStore[storeName])
      // the plugin action
      if (pluginAction) {
        const streamPromise = handleAction({
          pluginAction,
          pluginModuleConfig,
          payload, // should always use the payload as passed originally for clarity
          eventNameFnsMap,
          onError,
          actionName: 'stream',
          stopExecutionAfterAction,
          onNextStoresStream,
        })
        streamPromisePerStore[storeName] = streamPromise
      }
    }
    const promises = Object.values(streamPromisePerStore)
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        // todo: why can I not just write then(resolve)
        .then(() => resolve())
        .catch(reject)
    })
  }
}
