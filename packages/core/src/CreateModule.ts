import { O } from 'ts-toolbelt'
import { merge } from 'merge-anything'
import {
  actionNameTypeMap,
  ActionName,
  VueSyncAction,
  ActionConfig,
  ActionType,
} from './types/actions'
import { handleAction } from './moduleActions/handleAction'
import { SharedConfig, PlainObject, eventFnsMapWithDefaults } from './types/base'
import { VueSyncConfig } from '.'
import { isPromise } from 'is-what'
import getEventFnsPerStore from './getEventFnsPerStore'
import { PluginActionConfig } from './types/plugins'

export type VueSyncModuleInstance = {
  [action in ActionName]?: VueSyncAction // prettier-ignore
}

export type ModuleType = 'collection' | 'document'

// this is what the dev passes when creating a module
export type ModuleConfig = O.Merge<
  Partial<SharedConfig>,
  {
    type: ModuleType
    configPerStore?: {
      [storeName: string]: {
        [key: string]: any // whatever the dev passed for this plugin when creating a Vue Sync Module instance (`VueSyncPluginModuleConfig`)
      }
    }
  }
>

export function CreateModuleWithContext (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>
): VueSyncModuleInstance {
  function createActionHandler (actionName: ActionName, actionType: ActionType): VueSyncAction {
    return async function<T extends PlainObject> (
      payload: T,
      actionConfig: ActionConfig = {}
    ): Promise<Partial<T>> {
      // get config for action
      const config = merge(globalConfig, moduleConfig, actionConfig)
      // get eventFn array per store
      const eventFnsPerStore = getEventFnsPerStore(globalConfig, moduleConfig, actionConfig)
      const storesToExecute =
        config.executionOrder.insert || config.executionOrder[actionNameTypeMap.insert] || []
      if (storesToExecute.length === 0) {
        throw new Error('None of your store plugins have implemented this function.')
      }

      // abort mechanism
      type StopExecution = boolean | 'revert'
      let stopExecution: StopExecution = false
      /**
       * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
       *
       */
      function stopExecutionAfterAction (trueOrRevert: StopExecution = true): void {
        stopExecution = trueOrRevert
      }

      // handle and await each action in sequence
      let result: Partial<T> = payload
      for (const [i, storeName] of storesToExecute.entries()) {
        // find the action on the plugin
        const pluginAction = globalConfig.stores[storeName].actions.insert
        const pluginActionConfig: PluginActionConfig = {
          moduleType: moduleConfig.type,
          moduleConfig: moduleConfig?.configPerStore[storeName],
        }
        // the plugin action
        result = !pluginAction
          ? result
          : await handleAction({
              pluginAction,
              pluginActionConfig,
              payload: result,
              eventNameFnsMap: eventFnsMapWithDefaults(eventFnsPerStore[storeName]),
              onError: config.onError,
              actionName,
              stopExecutionAfterAction,
            })

        // handle reverting
        if ((stopExecution as StopExecution) === 'revert') {
          const storesToRevert = storesToExecute.slice(0, i)
          storesToRevert.reverse()
          for (const storeToRevert of storesToRevert) {
            const revertAction = globalConfig.stores[storeToRevert].revert
            result = await revertAction(actionName, result, pluginActionConfig)
            // revert eventFns
            const eventNameFnsMap = eventFnsMapWithDefaults(eventFnsPerStore[storeToRevert])
            // handle and await each eventFn in sequence
            for (const fn of eventNameFnsMap.revert) {
              const eventResult = fn({ payload: result, actionName })
              result = isPromise(eventResult) ? await eventResult : eventResult
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
  }

  const actions = Object.entries(actionNameTypeMap).reduce(
    (carry, [actionName, actionType]: [ActionName, ActionType]) => {
      carry[actionName] = createActionHandler(actionName, actionType)
      return carry
    },
    {} as { [key in ActionName]: VueSyncAction }
  )

  return {
    ...actions,
  }
}
