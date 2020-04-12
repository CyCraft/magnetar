import { isVueSyncError, ActionName } from '../types/actions'
import { SharedConfig, PlainObject } from '../types/base'
import { EventNameFnsMap } from '../types/events'
import {
  PluginModuleConfig,
  PluginGetAction,
  PluginWriteAction,
  PluginDeleteAction,
  PluginDeletePropAction,
  PluginInsertAction,
  GetResponse,
} from '../types/plugins'
import { OnAddedFn } from '../types/modifyReadResponse'

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
export async function handleAction (args: {
  modulePath: string
  pluginAction: PluginGetAction | PluginWriteAction | PluginDeletePropAction | PluginDeleteAction | PluginInsertAction // prettier-ignore
  pluginModuleConfig: PluginModuleConfig
  payload: void | PlainObject | PlainObject[] | string | string[]
  eventNameFnsMap: EventNameFnsMap
  onError: SharedConfig['onError']
  actionName: Exclude<ActionName, 'stream'>
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  storeName: string
}): Promise<void | string | GetResponse | OnAddedFn> {
  const {
    modulePath,
    pluginAction,
    pluginModuleConfig,
    payload,
    eventNameFnsMap: on,
    onError,
    actionName,
    stopExecutionAfterAction,
    storeName,
  } = args
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
    return
  }
  let result: void | string | GetResponse | OnAddedFn
  try {
    // triggering the action provided by the plugin
    result = await pluginAction(payload as any, modulePath, pluginModuleConfig)
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
      return
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result, actionName, storeName, abort })
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  return result
}
