import { O } from 'ts-toolbelt'
import { PlainObject } from '../types/atoms'
import { EventNameFnsMap } from '../types/events'
import {
  PluginModuleConfig,
  PluginStreamAction,
  DoOnStream,
  StreamResponse,
} from '../types/plugins'

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
export async function handleStream (args: {
  collectionPath: string
  docId: string | undefined
  pluginModuleConfig: PluginModuleConfig
  pluginAction: PluginStreamAction
  payload: PlainObject | void
  eventNameFnsMap: EventNameFnsMap
  actionName: 'stream'
  storeName: string
  mustExecuteOnRead: O.Compulsory<DoOnStream>
}): Promise<StreamResponse | DoOnStream> {
  const {
    collectionPath,
    docId,
    pluginModuleConfig,
    pluginAction,
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

  let result: StreamResponse | DoOnStream

  try {
    // triggering the action provided by the plugin
    const pluginStreamAction = pluginAction
    result = await pluginStreamAction(
      payload,
      [collectionPath, docId],
      pluginModuleConfig,
      mustExecuteOnRead
    )
  } catch (error) {
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload, actionName, storeName, error, abort })
    }
    throw error
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result, actionName, storeName, abort })
  }
  return result
}
