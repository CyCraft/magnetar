import { isPromise } from 'is-what'
import { isVueSyncError, ActionName } from '../types/actions'
import { EventNameFnsMap, SharedConfig } from '../types/base'
import { O } from 'ts-toolbelt'
import { PluginWriteAction, PluginActionConfig } from '../types/plugins'

export async function handleWrite<Payload extends object> (args: {
  pluginAction: PluginWriteAction
  pluginActionConfig: PluginActionConfig
  payload: Payload
  eventNameFnsMap: O.Compulsory<EventNameFnsMap>
  onError: SharedConfig['onError']
  actionName: ActionName
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
}): Promise<Partial<Payload>> {
  const {
    pluginAction,
    pluginActionConfig,
    payload,
    eventNameFnsMap: on,
    onError,
    actionName,
    stopExecutionAfterAction,
  } = args
  // create abort mechanism for current scope
  let abortExecution = false
  function abort (): void {
    abortExecution = true
  }
  let result: Partial<Payload> = payload // the payload throughout the stages
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    const eventResult = fn({ payload: result, actionName, abort })
    result = isPromise(eventResult) ? await eventResult : eventResult
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  try {
    result = await pluginAction(result, pluginActionConfig)
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      const eventResult = fn({ payload: error.payload, actionName, abort, error })
      result = isPromise(eventResult) ? await eventResult : eventResult
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
    const eventResult = fn({ payload: result, actionName, abort })
    result = isPromise(eventResult) ? await eventResult : eventResult
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  return result
}
