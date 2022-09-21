import { O } from 'ts-toolbelt'
import { isPromise } from 'is-what'
import {
  StreamResponse,
  DocMetadata,
  ModuleConfig,
  GlobalConfig,
  DoOnStreamFns,
  DoOnStream,
  ActionType,
  WriteLock,
  ActionConfig,
  MagnetarStreamAction,
} from '@magnetarjs/types'
import { handleStream } from './handleStream'
import { getEventNameFnsMap } from '../helpers/eventHelpers'
import { getModifyPayloadFnsMap } from '../helpers/modifyPayload'
import { getModifyReadResponseFnsMap } from '../helpers/modifyReadResponse'
import { executeOnFns } from '../helpers/executeOnFns'
import { throwOnIncompleteStreamResponses, throwIfNoFnsToExecute } from '../helpers/throwFns'
import { getPluginModuleConfig } from '../helpers/moduleHelpers'
import { getDocAfterWritelock, writeLockPromise } from '../helpers/writeLockHelpers'
import { isDoOnStream } from '../helpers/pluginHelpers'

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
     * Last incoming added/modified docs are cached here temporarily to prevent UI flashing because of the writeLock
     */
    const lastIncomingDocs = new Map<
      string,
      { payload: Record<string, any> | undefined; meta: DocMetadata }
    >()

    /**
     * this is what must be executed by a plugin store that implemented "stream" functionality
     */
    const mustExecuteOnRead: O.Compulsory<DoOnStream> = {
      added: async (_payload, _meta) => {
        // check if there's a WriteLock for the document:
        const docIdentifier = `${collectionPath}/${_meta.id}`
        const result = await getDocAfterWritelock({
          writeLockMap,
          docIdentifier,
          lastIncomingDocs,
          meta: _meta,
          payload: _payload,
        })

        // if `undefined` nothing further must be done
        if (!result) return

        return executeOnFns(doOnStreamFns.added, result.payload, [result.meta])
      },
      modified: async (_payload, _meta) => {
        // check if there's a WriteLock for the document:
        const docIdentifier = `${collectionPath}/${_meta.id}`
        const result = await getDocAfterWritelock({
          writeLockMap,
          docIdentifier,
          lastIncomingDocs,
          meta: _meta,
          payload: _payload,
        })

        // if `undefined` nothing further must be done
        if (!result) return

        return executeOnFns(doOnStreamFns.added, result.payload, [result.meta])
      },
      removed: async (_payload, _meta) => {
        // check if there's a WriteLock for the document
        const docIdentifier = `${collectionPath}/${_meta.id}`
        await writeLockPromise(writeLockMap, docIdentifier)

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

    // create a function to closeStream from the stream of each store
    const closeStream = (): void => {
      Object.values(streamInfoPerStore).forEach(({ stop }) => stop())
      cacheStream(() => {}, null)
    }
    // handle caching the returned promises
    const streamPromises = Object.values(streamInfoPerStore).map((res) => res.streaming)
    // create a single stream promise from multiple stream promises the store plugins return
    const streamPromise: Promise<void> = new Promise((resolve, reject) => {
      Promise.all(streamPromises)
        .then(() => {
          resolve()
          closeStream()
        })
        .catch((e) => {
          reject(e)
          closeStream()
        })
    })
    cacheStream(closeStream, streamPromise)
    // return the stream promise
    return streamPromise
  }
}
