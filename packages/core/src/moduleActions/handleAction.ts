import { isPromise } from 'is-what'
import { VueSyncAction, isVueSyncError, ActionName } from '../types/actions'
import { PlainObject, EventNameFnsMap, Config } from '../types/base'
import { O } from 'ts-toolbelt'

export async function handleAction<Payload extends PlainObject> (args: {
  pluginAction: VueSyncAction
  payload: Payload
  eventNameFnsMap: O.Compulsory<EventNameFnsMap>
  onError: Config['onError']
  actionName: ActionName
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
}): Promise<Partial<Payload>> {
  const {
    pluginAction,
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
    result = await pluginAction(result)
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
