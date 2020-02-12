import { isPromise } from 'is-what'
import { plainObject, PluginAction, ActionConfig } from '../types/actions'

export async function handleAction<Payload extends plainObject> (args: {
  pluginAction: PluginAction
  payload: Payload
  config: ActionConfig
  storeName: string
  stopExecutionAfterAction: () => void
}): Promise<Partial<Payload>> {
  const { pluginAction, payload, actionConfig, storeName, stopExecutionAfterAction } = args
  const { on: onPerStore } = actionConfig
  const on = onPerStore[storeName] || {}
  // create abort mechanism for current scope
  let abortExecution = false
  function abort (): void {
    abortExecution = true
  }
  let result: Partial<Payload> = payload // the payload throughout the stages
  // before hook
  if (on.before) {
    const eventResult = on.before({ payload: result, abort })
    result = isPromise(eventResult) ? await eventResult : eventResult
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    // return whatever is returned in the aborted event
    if (on.aborted) {
      const eventResult = on.aborted({ at: 'before', payload: result })
      result = isPromise(eventResult) ? await eventResult : eventResult
    }
    return result
  }
  try {
    result = await pluginAction(result)
  } catch (error) {
    // error hook
    if (on.error) {
      const eventResult = on.error({ payload: result, abort, error })
      result = isPromise(eventResult) ? await eventResult : eventResult
    }
    // abort?
    if (abortExecution) {
      stopExecutionAfterAction()
      // return whatever is returned in the aborted event
      if (on.aborted) {
        const eventResult = on.aborted({ at: 'error', payload: result })
        result = isPromise(eventResult) ? await eventResult : eventResult
      }
      return result
    }
  }
  // success hook
  if (on.success) {
    const eventResult = on.success({ payload: result, abort })
    result = isPromise(eventResult) ? await eventResult : eventResult
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    // return whatever is returned in the aborted event
    if (on.aborted) {
      const eventResult = on.aborted({ at: 'success', payload: result })
      result = isPromise(eventResult) ? await eventResult : eventResult
    }
    return result
  }
  return result
}
