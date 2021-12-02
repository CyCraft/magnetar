import { O } from 'ts-toolbelt'
import { isPromise } from 'is-what'
import { WriteLock } from '../Magnetar'
import { handleStream } from './handleStream'
import { ActionConfig, MagnetarStreamAction } from '../types/actions'
import { ActionType } from '../types/actionsInternal'
import { StreamResponse, DoOnStreamFns, isDoOnStream, DoOnStream } from '../types/plugins'
import { getEventNameFnsMap } from '../types/events'
import { getModifyPayloadFnsMap } from '../types/modifyPayload'
import { getModifyReadResponseFnsMap } from '../types/modifyReadResponse'
import { executeOnFns } from '../helpers/executeOnFns'
import { throwOnIncompleteStreamResponses, throwIfNoFnsToExecute } from '../helpers/throwFns'
import { ModuleConfig, GlobalConfig } from '../types/config'
import { getPluginModuleConfig } from '../helpers/moduleHelpers'
import { getCollectionWriteLocks } from '../helpers/pathHelpers'

export function handleStreamPerStore(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  actionType: ActionType,
  streaming: () => Promise<void> | null,
  cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void,
  writeLockMap: Map<string, WriteLock>
): MagnetarStreamAction {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (payload?: any, actionConfig: ActionConfig = {}): Promise<void> {
    // return the same stream promise if it's already open
    const foundStream = streaming()
    if (isPromise(foundStream)) return foundStream

    // we need to await any writeLock _before_ opening the stream to prevent grabbing outdated data
    const writeLock = docId ? writeLockMap.get(`${collectionPath}/${docId}`)! : writeLockMap.get(collectionPath)!
    if (isPromise(writeLock.promise)) await writeLock.promise
    if (!docId) {
      // we need to await all promises of all docs in this collection...
      const collectionWriteLocks = getCollectionWriteLocks(collectionPath, writeLockMap)
      await Promise.allSettled(collectionWriteLocks.map(w => w.promise))
    }

    // get all the config needed to perform this action
    const eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on)
    const modifyPayloadFnsMap = getModifyPayloadFnsMap(
      globalConfig.modifyPayloadOn,
      moduleConfig.modifyPayloadOn,
      actionConfig.modifyPayloadOn
    )
    const modifyReadResponseMap = getModifyReadResponseFnsMap(
      globalConfig.modifyReadResponseOn,
      moduleConfig.modifyReadResponseOn,
      actionConfig.modifyReadResponseOn
    )
    const storesToExecute: string[] =
      actionConfig.executionOrder ||
      (moduleConfig.executionOrder || {})['stream'] ||
      (moduleConfig.executionOrder || {})[actionType] ||
      (globalConfig.executionOrder || {})['stream'] ||
      (globalConfig.executionOrder || {})[actionType] ||
      []
    throwIfNoFnsToExecute(storesToExecute)
    // update the payload
    for (const modifyFn of modifyPayloadFnsMap['stream']) {
      payload = modifyFn(payload, docId)
    }

    const streamInfoPerStore: { [storeName: string]: StreamResponse } = {}

    const doOnStreamFns: DoOnStreamFns = {
      added: modifyReadResponseMap.added,
      modified: modifyReadResponseMap.modified,
      removed: modifyReadResponseMap.removed,
    }

    /**
     * this is what must be executed by a plugin store that implemented "stream" functionality
     */
    const mustExecuteOnRead: O.Compulsory<DoOnStream> = {
      added: async (_payload, _meta) => {
        // check if there's a WriteLock for the document:
        const _writeLock = writeLockMap.get(`${collectionPath}/${_meta.id}`)
        if (_writeLock && isPromise(_writeLock.promise)) {
          await _writeLock.promise
        }
        return executeOnFns(doOnStreamFns.added, _payload, [_meta])
      },
      modified: async (_payload, _meta) => {
        // check if there's a WriteLock for the document:
        const _writeLock = writeLockMap.get(`${collectionPath}/${_meta.id}`)
        if (_writeLock && isPromise(_writeLock.promise)) {
          await _writeLock.promise
        }
        return executeOnFns(doOnStreamFns.modified, _payload, [_meta])
      },
      removed: async (_payload, _meta) => {
        return executeOnFns(doOnStreamFns.removed, _payload, [_meta])
      },
    }

    // handle and await each action in sequence
    for (const storeName of storesToExecute) {
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName].actions['stream']
      const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName)

      // the plugin action
      if (pluginAction) {
        const result = await handleStream({
          collectionPath,
          docId,
          pluginModuleConfig,
          pluginAction,
          actionConfig,
          payload, // should always use the payload as passed originally for clarity
          eventNameFnsMap,
          actionName: 'stream',
          storeName,
          mustExecuteOnRead,
        })
        // if the plugin action for stream returns a "do on read" result
        if (isDoOnStream(result)) {
          // register the functions we received: result
          for (const [doOn, doFn] of Object.entries(result)) {
            if (doFn) doOnStreamFns[doOn as 'added' | 'modified' | 'removed'].push(doFn as any)
          }
        }
        // if the plugin action for stream returns a "stream response" result
        if (!isDoOnStream(result)) {
          streamInfoPerStore[storeName] = result
        }
      }
    }
    throwOnIncompleteStreamResponses(streamInfoPerStore, doOnStreamFns)

    // handle caching the returned promises
    const streamPromises = Object.values(streamInfoPerStore).map((res) => res.streaming)
    // create a single stream promise from multiple stream promises the store plugins return
    const streamPromise: Promise<void> = new Promise((resolve, reject) => {
      Promise.all(streamPromises)
        // todo: why can I not just write then(resolve)
        .then(() => resolve())
        .catch(reject)
    })
    // create a function to closeStream from the stream of each store
    const closeStream = (): void => {
      Object.values(streamInfoPerStore).forEach(({ stop }) => stop())
      cacheStream(() => {}, null)
    }
    cacheStream(closeStream, streamPromise)
    // return the stream promise
    return streamPromise
  }
}
