import { plainObject } from '../types'

export async function handleAction ({
  pluginAction,
  payload,
  on,
  storeName,
}): Promise<plainObject> {
  // create abort mechanism
  let abortExecution = false
  function abort (): void {
    abortExecution = true
  }
  let result: plainObject // the payload throughout the stages
  // before hook
  if (on.before) {
    result = on.before({ payload, abort })
  }
  // abort?
  if (abortExecution) {
    // return whatever is returned in the aborted event
    if (on.aborted) return on.aborted({ at: 'before', storeName, payload })
    // return the result when there's no event
    return result
  }
  try {
    result = await pluginAction(payload)
  } catch (error) {
    // error hook
    if (on.error) {
      result = on.error({ payload, abort, error })
    }
    // abort?
    if (abortExecution) {
      // return whatever is returned in the aborted event
      if (on.aborted) return on.aborted({ at: 'error', storeName, payload })
      // return the result when there's no event
      return result
    }
  }
  // success hook
  if (on.success) {
    result = on.success({ payload, abort })
  }
  // abort?
  if (abortExecution) {
    // return whatever is returned in the aborted event
    if (on.aborted) on.aborted({ at: 'success', storeName, payload })
    // return the result when there's no event
    return result
  }
  return result
}
