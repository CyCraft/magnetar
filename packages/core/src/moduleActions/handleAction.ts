import { isVueSyncError, ActionName } from '../types/actions'
import { SharedConfig, Modified, PlainObject } from '../types/base'
import { EventNameFnsMap, EventFnSuccess } from '../types/events'
import { O } from 'ts-toolbelt'
import {
  PluginModuleConfig,
  PluginActionTernary,
  PluginGetAction,
  PluginWriteAction,
} from '../types/plugins'

function isUndefined (payload: any): payload is undefined | void {
  return payload === undefined
}

export function handleAction<
  Payload extends PlainObject,
  TActionName extends Exclude<ActionName, 'stream'>
> (args: {
  pluginAction: PluginActionTernary<TActionName>
  pluginModuleConfig: PluginModuleConfig
  payload: Payload
  eventNameFnsMap: O.Compulsory<EventNameFnsMap>
  onError: SharedConfig['onError']
  actionName: TActionName
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccess[]
}): Promise<void | PlainObject | PlainObject[] | Modified<Payload>>

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
export async function handleAction<Payload extends PlainObject> (args: {
  pluginAction: PluginGetAction | PluginWriteAction
  pluginModuleConfig: PluginModuleConfig
  payload: Payload
  eventNameFnsMap: O.Compulsory<EventNameFnsMap>
  onError: SharedConfig['onError']
  actionName: Exclude<ActionName, 'stream'>
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccess[]
}): Promise<PlainObject | PlainObject[] | void | undefined | Modified<Payload>> {
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
  let payloadAfterBeforeEvent: Modified<Payload> = payload // the payload throughout the stages
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    const eventResult = await fn({ payload: payloadAfterBeforeEvent, actionName, abort })
    // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
    if (!isUndefined(eventResult)) payloadAfterBeforeEvent = eventResult
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    // return the proper return type based on the ActionName
    return payloadAfterBeforeEvent
  }
  let result: PlainObject | PlainObject[] | void | Modified<Payload> = payloadAfterBeforeEvent
  try {
    // triggering the action provided by the plugin
    // @ts-ignore
    result = await pluginAction(
      result as Modified<Payload>,
      pluginModuleConfig,
      onNextStoresSuccess
    )
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      const eventResult = await fn({ payload: payloadAfterBeforeEvent, actionName, abort, error })
      // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
      if (!isUndefined(eventResult)) result = eventResult
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
    const eventResult = await fn({ payload: payloadAfterBeforeEvent, result, actionName, abort })
    // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
    if (!isUndefined(eventResult)) result = eventResult
  }
  // handle and await each "onNextStoresSuccess" eventFn in sequence (besides the ones just added of course)
  for (const fn of successEventsToExecute) {
    await fn({ payload: payloadAfterBeforeEvent, result, actionName, abort })
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  return result
}
