import { isPromise } from 'is-what'
import { plainObject, PluginAction, ActionConfig } from '../types/actions'

export async function handleAction<Payload extends plainObject> (args: {
  pluginAction: PluginAction
  payload: Payload
  actionConfig: ActionConfig
  storeName: string
  wasAborted: () => void
}): Promise<Partial<Payload>> {
  const { pluginAction, payload, actionConfig, storeName, wasAborted } = args
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
    const eventResult = on.before({ payload, abort })
    result = isPromise(eventResult) ? await eventResult : eventResult
  }
  // abort?
  if (abortExecution) {
    wasAborted()
    // return whatever is returned in the aborted event
    if (on.aborted) {
      const eventResult = on.aborted({ at: 'before', payload })
      return isPromise(eventResult) ? await eventResult : eventResult
    }
    // return the result when there's no event
    return result
  }
  try {
    result = await pluginAction(payload)
  } catch (error) {
    // error hook
    if (on.error) {
      const eventResult = on.error({ payload, abort, error })
      result = isPromise(eventResult) ? await eventResult : eventResult
    }
    // abort?
    if (abortExecution) {
      wasAborted()
      // return whatever is returned in the aborted event
      if (on.aborted) {
        const eventResult = on.aborted({ at: 'error', payload })
        return isPromise(eventResult) ? await eventResult : eventResult
      }
      // return the result when there's no event
      return result
    }
  }
  // success hook
  if (on.success) {
    const eventResult = on.success({ payload, abort })
    result = isPromise(eventResult) ? await eventResult : eventResult
  }
  // abort?
  if (abortExecution) {
    wasAborted()
    // return whatever is returned in the aborted event
    if (on.aborted) {
      const eventResult = on.aborted({ at: 'success', payload })
      return isPromise(eventResult) ? await eventResult : eventResult
    }
    // return the result when there's no event
    return result
  }
  return result
}
