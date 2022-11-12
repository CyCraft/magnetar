import { O } from 'ts-toolbelt'
import {
  ActionConfig,
  EventNameFnsMap,
  PluginModuleConfig,
  PluginStreamAction,
  DoOnStream,
  StreamResponse,
} from '@magnetarjs/types'

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
export async function handleStream(args: {
  collectionPath: string
  docId: string | undefined
  pluginModuleConfig: PluginModuleConfig
  pluginAction: PluginStreamAction
  payload: Record<string, unknown> | void
  actionConfig: ActionConfig
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
    actionConfig = {},
    eventNameFnsMap: on,
    actionName,
    storeName,
    mustExecuteOnRead,
  } = args
  // no aborting possible in stream actions
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const abort = () => {}
  const path = [collectionPath, docId].filter(Boolean).join('/')

  // handle and await each eventFn in sequence
  for (const fn of on.before) {
    await fn({ payload, actionName, storeName, abort, collectionPath, docId, path, pluginModuleConfig }) // prettier-ignore
  }

  let result: StreamResponse | DoOnStream

  try {
    // triggering the action provided by the plugin
    const pluginStreamAction = pluginAction
    result = await pluginStreamAction({
      payload,
      actionConfig,
      collectionPath,
      docId,
      pluginModuleConfig,
      mustExecuteOnRead,
    })
  } catch (error) {
    // handle and await each eventFn in sequence
    for (const fn of on.error) {
      await fn({ payload, actionName, storeName, error, abort, collectionPath, docId, path, pluginModuleConfig }) // prettier-ignore
    }
    throw error
  }
  // handle and await each eventFn in sequence
  for (const fn of on.success) {
    await fn({ payload, result, actionName, storeName, abort, collectionPath, docId, path, pluginModuleConfig }) // prettier-ignore
  }
  return result
}
