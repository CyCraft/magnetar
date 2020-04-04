import { isVueSyncError, ActionName, isWriteAction } from '../types/actions'
import { SharedConfig, PlainObject } from '../types/base'
import { EventNameFnsMap, EventFnSuccessTernary, EventFnSuccess } from '../types/events'
import { O } from 'ts-toolbelt'
import {
  PluginModuleConfig,
  PluginActionTernary,
  PluginGetAction,
  PluginWriteAction,
  PluginDeleteAction,
} from '../types/plugins'

function isUndefined (payload: any): payload is undefined | void {
  return payload === undefined
}

export function handleAction<
  Payload extends void | PlainObject | string | string[],
  TActionName extends Exclude<ActionName, 'stream'>
> (args: {
  pluginAction: PluginActionTernary<TActionName>
  pluginModuleConfig: PluginModuleConfig
  payload: Payload
  eventNameFnsMap: O.Compulsory<EventNameFnsMap<TActionName>>
  onError: SharedConfig['onError']
  actionName: TActionName
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccessTernary<TActionName>[]
}): Promise<void | PlainObject | PlainObject[]>

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
export async function handleAction (args: {
  pluginAction: PluginGetAction | PluginWriteAction | PluginDeleteAction
  pluginModuleConfig: PluginModuleConfig
  payload: void | PlainObject | string | string[]
  eventNameFnsMap: O.Compulsory<EventNameFnsMap<Exclude<ActionName, 'stream'>>>
  onError: SharedConfig['onError']
  actionName: Exclude<ActionName, 'stream'>
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccess[]
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
  } = args
  const successEventsToExecute = [...onNextStoresSuccess]

  // create abort mechanism for current scope
  let abortExecution = false
  const abort = (): void => {
    abortExecution = true
  }
  let payloadAfterBeforeEvent: PlainObject | string | string[] | void = payload // the payload throughout the stages
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    // @ts-ignore
    const eventResult = await fn({ payload: payloadAfterBeforeEvent, actionName, abort })
    // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
    if (!isUndefined(eventResult)) payloadAfterBeforeEvent = eventResult
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    // return the proper return type based on the ActionName
    if (actionName === 'delete' || actionName === 'get') return
    // @ts-ignore
    return payloadAfterBeforeEvent
  }
  // @ts-ignore
  let result: PlainObject | PlainObject[] | void = isWriteAction(actionName)
    ? payloadAfterBeforeEvent
    : undefined
  try {
    // triggering the action provided by the plugin
    // @ts-ignore
    result = await pluginAction(payloadAfterBeforeEvent, pluginModuleConfig, onNextStoresSuccess)
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      // @ts-ignore
      await fn({ payload: payloadAfterBeforeEvent, actionName, abort, error })
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
    // @ts-ignore
    await fn({ payload: payloadAfterBeforeEvent, result, actionName, abort })
  }
  // handle and await each "onNextStoresSuccess" eventFn in sequence (besides the ones just added of course)
  for (const fn of successEventsToExecute) {
    // @ts-ignore
    await fn({ payload: payloadAfterBeforeEvent, result, actionName, abort })
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  return result
}
