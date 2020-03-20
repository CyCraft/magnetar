import { O } from 'ts-toolbelt'
import { isPromise } from 'is-what'
import { VueSyncConfig } from '..'
import { ModuleConfig } from '../CreateModule'
import { getEventFnsPerStore } from '../getEventFnsPerStore'
import { handleAction } from './handleAction'
import { EventFnsPerStore, eventFnsMapWithDefaults, EventFnSuccess } from '../types/events'
import {
  ActionType,
  ActionConfig,
  ActionName,
  ActionResultTernary,
  ActionTernary,
} from '../types/actions'
import { PluginModuleConfig, PluginActionTernary } from '../types/plugins'

function isUndefined (payload: any): payload is undefined | void {
  return payload === undefined
}

export function handleActionPerStore<TActionName extends Exclude<ActionName, 'stream'>> (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>,
  actionName: TActionName,
  actionType: ActionType
): ActionTernary<TActionName> {
  // returns the action the dev can call with myModule.insert() etc.
  const action = async function<T extends object> (
    payload: T,
    actionConfig: ActionConfig = {}
  ): Promise<ActionResultTernary<TActionName, T>> {
    // get all the config needed to perform this action
    const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError
    const eventFnsPerStore: EventFnsPerStore = getEventFnsPerStore(
      globalConfig,
      moduleConfig,
      actionConfig
    )
    const storesToExecute: string[] =
      actionConfig.executionOrder ||
      (moduleConfig.executionOrder || {})[actionName] ||
      (moduleConfig.executionOrder || {})[actionType] ||
      (globalConfig.executionOrder || {})[actionName] ||
      (globalConfig.executionOrder || {})[actionType] ||
      []
    if (storesToExecute.length === 0) {
      throw new Error('None of your store plugins have implemented this function.')
    }

    // create the abort mechanism
    type StopExecution = boolean | 'revert'
    let stopExecution: StopExecution = false
    /**
     * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
     *
     */
    function stopExecutionAfterAction (trueOrRevert: StopExecution = true): void {
      stopExecution = trueOrRevert
    }

    // a mutatable array of successevents which is to be triggered after each store
    const onNextStoresSuccess: EventFnSuccess[] = []

    // handle and await each action in sequence
    let result = (payload as unknown) as ActionResultTernary<TActionName, T>
    for (const [i, storeName] of storesToExecute.entries()) {
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName]
        .actions[actionName] as PluginActionTernary<TActionName> // prettier-ignore
      const pluginModuleConfig: PluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
      const eventNameFnsMap = eventFnsMapWithDefaults(eventFnsPerStore[storeName])
      // the plugin action
      result = !pluginAction
        ? result
        : await handleAction({
            pluginAction,
            pluginModuleConfig,
            payload, // should always use the payload as passed originally for clarity
            eventNameFnsMap,
            onError,
            actionName,
            stopExecutionAfterAction,
            onNextStoresSuccess,
          })
      // handle reverting
      if ((stopExecution as StopExecution) === 'revert') {
        const storesToRevert = storesToExecute.slice(0, i)
        storesToRevert.reverse()
        for (const storeToRevert of storesToRevert) {
          const pluginRevertAction = globalConfig.stores[storeToRevert].revert
          result = await pluginRevertAction(actionName, result, pluginModuleConfig)
          // revert eventFns
          const eventNameFnsMap = eventFnsMapWithDefaults(eventFnsPerStore[storeToRevert])
          // handle and await each eventFn in sequence
          for (const fn of eventNameFnsMap.revert) {
            const eventResult = fn({ payload, result, actionName })
            const eventResultResolved = isPromise(eventResult) ? await eventResult : eventResult
            if (!isUndefined(eventResultResolved))
              result = (eventResultResolved as unknown) as ActionResultTernary<TActionName, T>
          }
        }
        // return result early to prevent going to the next store
        return result
      }

      // handle abortion
      if ((stopExecution as StopExecution) === true) {
        // return result early to prevent going to the next store
        return result
      }
    }
    return result
  }
  return (action as unknown) as ActionTernary<TActionName>
}
