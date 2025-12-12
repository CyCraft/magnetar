import type {
  ActionConfig,
  DoOnStream,
  EventNameFnsMap,
  PluginModuleConfig,
  PluginStreamAction,
  StreamResponse,
  WriteLock,
} from '@magnetarjs/types'

/**
 * handleStream is responsible for executing (1) on.before (2) the action provided by the store plugin (3) on.error / on.success
 */
export async function handleStream(args: {
  collectionPath: string
  docId: string | undefined
  pluginModuleConfig: PluginModuleConfig
  pluginAction: PluginStreamAction
  payload: { [key: string]: unknown } | undefined
  actionConfig: ActionConfig
  eventNameFnsMap: EventNameFnsMap
  actionName: 'stream'
  storeName: string
  mustExecuteOnRead: Required<DoOnStream>
  writeLockMap: Map<string, WriteLock>
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
    writeLockMap,
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
      writeLockMap,
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
