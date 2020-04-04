import { isVueSyncError, ActionName, isWriteAction } from '../types/actions'
import { SharedConfig, PlainObject } from '../types/base'
import { EventNameFnsMap, EventFnSuccess } from '../types/events'
import {
  PluginModuleConfig,
  PluginActionTernary,
  PluginGetAction,
  PluginWriteAction,
  PluginDeleteAction,
} from '../types/plugins'

export function handleAction<
  Payload extends void | PlainObject | string | string[],
  TActionName extends Exclude<ActionName, 'stream'>
> (args: {
  pluginAction: PluginActionTernary<TActionName>
  pluginModuleConfig: PluginModuleConfig
  payload: Payload
  eventNameFnsMap: EventNameFnsMap
  onError: SharedConfig['onError']
  actionName: TActionName
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccess[]
  storeName: string
}): Promise<void | PlainObject | PlainObject[]>

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
export async function handleAction (args: {
  pluginAction: PluginGetAction | PluginWriteAction | PluginDeleteAction
  pluginModuleConfig: PluginModuleConfig
  payload: void | PlainObject | string | string[]
  eventNameFnsMap: EventNameFnsMap
  onError: SharedConfig['onError']
  actionName: Exclude<ActionName, 'stream'>
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccess[]
  storeName: string
}): Promise<void | PlainObject | PlainObject[]> {
  const {
    pluginAction,
    pluginModuleConfig,
    payload,
    eventNameFnsMap: on,
    onError,
    actionName,
    stopExecutionAfterAction,
    onNextStoresSuccess,
    storeName,
  } = args
  const successEventsToExecute = [...onNextStoresSuccess]

  // create abort mechanism for current scope
  let abortExecution = false
  const abort = (): void => {
    abortExecution = true
  }
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    await fn({ payload, actionName, storeName, abort })
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    // return the proper return type based on the ActionName
    if (actionName === 'delete' || actionName === 'get') return
    // @ts-ignore
    return payload
  }
  // @ts-ignore
  let result: PlainObject | PlainObject[] | void = isWriteAction(actionName) ? payload : undefined
  try {
    // triggering the action provided by the plugin
    // @ts-ignore
    result = await pluginAction(payload, pluginModuleConfig, onNextStoresSuccess)
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload, actionName, storeName, abort, error })
    }
    // abort?
    if (abortExecution || onError === 'stop') {
      stopExecutionAfterAction()
      throw error
    }
    if (onError === 'revert') {
      stopExecutionAfterAction('revert')
      return result
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result, actionName, storeName, abort })
  }
  // handle and await each "onNextStoresSuccess" eventFn in sequence (besides the ones just added of course)
  for (const fn of successEventsToExecute) {
    await fn({ payload, result, actionName, storeName, abort })
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  return result
}
