import { isVueSyncError } from '../types/actions'
import { PlainObject } from '../types/base'
import { EventNameFnsMap } from '../types/events'
import { O } from 'ts-toolbelt'
import { PluginModuleConfig, OnNextStoresStream, PluginStreamAction } from '../types/plugins'

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
  eventNameFnsMap: O.Compulsory<EventNameFnsMap<'stream'>>
  actionName: 'stream'
  onNextStoresStream: OnNextStoresStream
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
    onNextStoresStream,
  } = args

  let payloadAfterBeforeEvent: PlainObject = payload // the payload throughout the stages
  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    const eventResult = await fn({ payload: payloadAfterBeforeEvent, actionName, abort: undefined })
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
      onNextStoresStream
    )
    if (!streamResponsePlugin) return undefined
    streaming = streamResponsePlugin.streaming
    stop = streamResponsePlugin.stop
  } catch (error) {
    if (!isVueSyncError(error)) throw new Error(error)
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload: payloadAfterBeforeEvent, actionName, error, abort: undefined })
    }
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload: payloadAfterBeforeEvent, result: undefined, actionName, abort: undefined })
  }
  return {
    streaming,
    stop,
  }
}
