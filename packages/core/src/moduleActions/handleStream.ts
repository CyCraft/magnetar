import { isVueSyncError } from '../types/actions'
import { PlainObject } from '../types/base'
import { EventNameFnsMap } from '../types/events'
import { PluginModuleConfig, OnStream, PluginStreamAction } from '../types/plugins'

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
export async function handleStream (args: {
  pluginAction: PluginStreamAction
  pluginModuleConfig: PluginModuleConfig
  payload: PlainObject
  eventNameFnsMap: EventNameFnsMap
  actionName: 'stream'
  onStream: OnStream
  storeName: string
}): Promise<
  | {
      streaming: Promise<void>
      stop: () => void
    }
  | undefined
  | void
> {
  const {
    pluginAction,
    pluginModuleConfig,
    payload,
    eventNameFnsMap: on,
    actionName,
    onStream,
    storeName,
  } = args
  // no aborting possible in stream actions
  const abort = undefined

  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    await fn({ payload, actionName, storeName, abort })
  }

  let streaming: Promise<void>
  let stop: () => void

  try {
    // triggering the action provided by the plugin
    const pluginStreamAction = pluginAction as PluginStreamAction
    const streamResponsePlugin = await pluginStreamAction(payload, pluginModuleConfig, onStream)
    if (!streamResponsePlugin) return undefined
    streaming = streamResponsePlugin.streaming
    stop = streamResponsePlugin.stop
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload, actionName, storeName, error, abort })
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result: undefined, actionName, storeName, abort })
  }
  return {
    streaming,
    stop,
  }
}
