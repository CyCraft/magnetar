import { isVueSyncError } from '../types/actions'
import { PlainObject } from '../types/base'
import { EventNameFnsMap } from '../types/events'
import { PluginModuleConfig, PluginStreamAction, DoOnRead, StreamResponse } from '../types/plugins'
import { O } from 'ts-toolbelt'

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
export async function handleStream (args: {
  modulePath: string
  pluginAction: PluginStreamAction
  pluginModuleConfig: PluginModuleConfig
  payload: PlainObject | void
  eventNameFnsMap: EventNameFnsMap
  actionName: 'stream'
  storeName: string
  mustExecuteOnRead: O.Compulsory<DoOnRead>
}): Promise<StreamResponse | DoOnRead> {
  const {
    modulePath,
    pluginAction,
    pluginModuleConfig,
    payload,
    eventNameFnsMap: on,
    actionName,
    storeName,
    mustExecuteOnRead,
  } = args
  // no aborting possible in stream actions
  const abort = undefined

  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    await fn({ payload, actionName, storeName, abort })
  }

  let result: StreamResponse | DoOnRead

  try {
    // triggering the action provided by the plugin
    const pluginStreamAction = pluginAction as PluginStreamAction
    result = await pluginStreamAction(payload, modulePath, pluginModuleConfig, mustExecuteOnRead)
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload, actionName, storeName, error, abort })
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result, actionName, storeName, abort })
  }
  return result
}
