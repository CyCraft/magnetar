import { O } from 'ts-toolbelt'
import { VueSyncConfig } from '..'
import { ModuleConfig } from '../CreateModule'
import { handleAction } from './handleAction'
import { EventFnSuccess, getEventNameFnsMap } from '../types/events'
import {
  ActionType,
  ActionConfig,
  ActionName,
  ActionTernary,
  VueSyncGetAction,
  VueSyncWriteAction,
  VueSyncDeleteAction,
} from '../types/actions'
import { PluginModuleConfig } from '../types/plugins'
import { getModifyPayloadFnsMap } from '../types/modifyPayload'

export function handleActionPerStore<TActionName extends Exclude<ActionName, 'stream'>> (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>,
  actionName: TActionName,
  actionType: ActionType
): ActionTernary<TActionName>

export function handleActionPerStore (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>,
  actionName: Exclude<ActionName, 'stream'>,
  actionType: ActionType
): VueSyncGetAction | VueSyncWriteAction | VueSyncDeleteAction {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (
    payload?: void | object | string | string[],
    actionConfig: ActionConfig = {}
  ): Promise<void | object | object[]> {
    // get all the config needed to perform this action
    const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError
    const modifyPayloadFnsMap = getModifyPayloadFnsMap(
      globalConfig.modifyPayloadOn,
      moduleConfig.modifyPayloadOn,
      actionConfig.modifyPayloadOn
    )
    const eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on)
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
    // update the payload in case it's a write or delete action
    if (actionType !== 'read') {
      for (const modifyFn of modifyPayloadFnsMap[actionName]) {
        payload = modifyFn(payload)
      }
    }

    // create the abort mechanism
    type StopExecution = boolean | 'revert'
    let stopExecution = false as StopExecution
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
    let result: void | object | object[]
    for (const [i, storeName] of storesToExecute.entries()) {
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName].actions[actionName]
      const pluginModuleConfig: PluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
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
            storeName,
          })
      // handle reverting
      if (stopExecution === 'revert') {
        const storesToRevert = storesToExecute.slice(0, i)
        storesToRevert.reverse()
        for (const storeToRevert of storesToRevert) {
          const pluginRevertAction = globalConfig.stores[storeToRevert].revert
          await pluginRevertAction(actionName, payload, pluginModuleConfig)
          // revert eventFns, handle and await each eventFn in sequence
          for (const fn of eventNameFnsMap.revert) {
            await fn({ payload, result, actionName, storeName })
          }
        }
        // return result early to prevent going to the next store
        return result
      }

      // handle abortion
      if (stopExecution === true) {
        // return result early to prevent going to the next store
        return result
      }
    }
    return result
  }
}
