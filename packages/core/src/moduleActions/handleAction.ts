import { ActionConfig, ActionName } from '../types/actions'

import { EventNameFnsMap } from '../types/events'
import {
  PluginModuleConfig,
  PluginFetchAction,
  PluginWriteAction,
  PluginDeleteAction,
  PluginDeletePropAction,
  PluginInsertAction,
  FetchResponse,
} from '../types/plugins'
import { OnAddedFn } from '../types/modifyReadResponse'

/**
 * handleAction is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success (4) optional: onNextStoresSuccess.
 * in any event/hook it's possible for the dev to modify the result & also abort the execution chain, which prevents calling handleAction on the next store as well
 */
export async function handleAction(args: {
  collectionPath: string
  docId: string | undefined
  modulePath: string
  pluginModuleConfig: PluginModuleConfig
  pluginAction: PluginFetchAction | PluginWriteAction | PluginDeletePropAction | PluginDeleteAction | PluginInsertAction // prettier-ignore
  payload: void | Record<string, any> | Record<string, any>[] | string | string[]
  actionConfig: ActionConfig
  eventNameFnsMap: EventNameFnsMap
  onError: 'revert' | 'continue' | 'stop'
  actionName: Exclude<ActionName, 'stream'>
  stopExecutionAfterAction: (arg?: boolean | 'revert') => void
  storeName: string
}): Promise<void | string | FetchResponse | OnAddedFn | unknown> {
  const {
    collectionPath,
    docId,
    modulePath,
    pluginModuleConfig,
    pluginAction,
    payload,
    actionConfig = {},
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
    await fn({ payload, actionName, storeName, abort, collectionPath, docId, path: modulePath, pluginModuleConfig }) // prettier-ignore
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return
  }
  let result: void | string | FetchResponse | OnAddedFn
  try {
    // triggering the action provided by the plugin
    result = await pluginAction({
      payload,
      actionConfig,
      collectionPath,
      docId,
      pluginModuleConfig,
    } as any)
  } catch (error) {
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload, actionName, storeName, abort, error, collectionPath, docId, path: modulePath, pluginModuleConfig }) // prettier-ignore
    }
    // abort?
    if (abortExecution || onError === 'stop') {
      stopExecutionAfterAction()
      throw error
    }
    if (onError === 'revert') {
      stopExecutionAfterAction('revert')
      // we need to revert first, then throw the error later
      return error
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result, actionName, storeName, abort, collectionPath, docId, path: modulePath, pluginModuleConfig }) // prettier-ignore
  }
  // abort?
  if (abortExecution) {
    stopExecutionAfterAction()
    return result
  }
  return result
}
