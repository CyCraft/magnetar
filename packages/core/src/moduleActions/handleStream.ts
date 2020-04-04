import { isVueSyncError } from '../types/actions'
import { PlainObject } from '../types/base'
import { EventNameFnsMap } from '../types/events'
import { PluginModuleConfig, OnStream, PluginStreamAction } from '../types/plugins'

function isUndefined (payload: any): payload is undefined | void {
  return payload === undefined
}

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

  let payloadAfterBeforeEvent: PlainObject = payload // the payload throughout the stages
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    // @ts-ignore
    const eventResult = await fn({ payload: payloadAfterBeforeEvent, actionName, storeName, abort })
    // overwrite the result with whatever the dev returns in the event function, as long as it's not undefined
    if (!isUndefined(eventResult)) payloadAfterBeforeEvent = eventResult
  }

  let streaming: Promise<void>
  let stop: () => void

  try {
    // triggering the action provided by the plugin
    const pluginStreamAction = pluginAction as PluginStreamAction
    const streamResponsePlugin = await pluginStreamAction(
      payloadAfterBeforeEvent,
      pluginModuleConfig,
      onStream
    )
    if (!streamResponsePlugin) return undefined
    streaming = streamResponsePlugin.streaming
    stop = streamResponsePlugin.stop
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      // @ts-ignore
      await fn({ payload: payloadAfterBeforeEvent, actionName, storeName, error, abort })
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    // @ts-ignore
    await fn({ payload: payloadAfterBeforeEvent, result: undefined, actionName, storeName, abort })
  }
  return {
    streaming,
    stop,
  }
}
