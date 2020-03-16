import { isPromise } from 'is-what'
import { isVueSyncError, ActionName } from '../types/actions'
import { SharedConfig, Modified, PlainObject } from '../types/base'
import { EventNameFnsMap, EventFnSuccess } from '../types/events'
import { O } from 'ts-toolbelt'
import { PluginWriteAction, PluginGetAction, PluginModuleConfig } from '../types/plugins'

function isUndefined (payload: any): payload is undefined | void {
  return payload === undefined
}

export async function handleAction<Payload extends PlainObject> (args: {
  pluginAction: PluginWriteAction | PluginGetAction
  pluginModuleConfig: PluginModuleConfig
  payload: Payload
  eventNameFnsMap: O.Compulsory<EventNameFnsMap>
  onError: SharedConfig['onError']
  actionName: ActionName
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  onNextStoresSuccess: EventFnSuccess[]
}): Promise<PlainObject | PlainObject[] | Modified<Payload>> {
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
  const pluginActionTypeSafe =
    actionName === 'get' ? (pluginAction as PluginGetAction) : (pluginAction as PluginWriteAction)

  // create abort mechanism for current scope
  let abortExecution = false
  function abort (): void {
    abortExecution = true
  }
  let payloadAfterBeforeEvent: Modified<Payload> = payload // the payload throughout the stages
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    const eventResult = fn({ payload: payloadAfterBeforeEvent, actionName, abort })
    const eventResultResolved = isPromise(eventResult) ? await eventResult : eventResult
    // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
    if (!isUndefined(eventResultResolved)) payloadAfterBeforeEvent = eventResultResolved
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return payloadAfterBeforeEvent
  }
  let result: PlainObject | Modified<Payload> = payloadAfterBeforeEvent
  try {
    result = await pluginActionTypeSafe(
      result as Modified<Payload>,
      pluginModuleConfig,
      onNextStoresSuccess
    )
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      const eventResult = fn({ payload: payloadAfterBeforeEvent, actionName, abort, error })
      const eventResultResolved = isPromise(eventResult) ? await eventResult : eventResult
      // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
      if (!isUndefined(eventResultResolved)) result = eventResultResolved
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
    const eventResult = fn({ payload: payloadAfterBeforeEvent, result, actionName, abort })
    const eventResultResolved = isPromise(eventResult) ? await eventResult : eventResult
    // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
    if (!isUndefined(eventResultResolved)) result = eventResultResolved
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
