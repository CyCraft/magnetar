import type {
  ActionConfig,
  ActionType,
  DocMetadata,
  DoOnStream,
  DoOnStreamFns,
  GlobalConfig,
  MagnetarStreamAction,
  ModuleConfig,
  StreamResponse,
  WriteLock,
} from '@magnetarjs/types'
import { isPromise } from 'is-what'
import { getEventNameFnsMap } from '../helpers/eventHelpers.js'
import { executeOnFns } from '../helpers/executeOnFns.js'
import { getModifyPayloadFnsMap } from '../helpers/modifyPayload.js'
import { getModifyReadResponseFnsMap } from '../helpers/modifyReadResponse.js'
import { getPluginModuleConfig } from '../helpers/moduleHelpers.js'
import { isDoOnStream } from '../helpers/pluginHelpers.js'
import { throwIfNoFnsToExecute, throwOnIncompleteStreamResponses } from '../helpers/throwFns.js'
import { getDocAfterWritelock, writeLockPromise } from '../helpers/writeLockHelpers.js'
import { handleStream } from './handleStream.js'

export function handleStreamPerStore(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: Required<GlobalConfig>,
  actionType: ActionType,
  streaming: () => Promise<void> | null,
  cacheStream: (closeStreamFn: () => void, streamingPromise: Promise<void> | null) => void,
  writeLockMap: Map<string, WriteLock>,
): MagnetarStreamAction {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (payload?: any, actionConfig: ActionConfig = {}): Promise<void> {
    // return the same stream promise if it's already open
    const foundStream = streaming()
    if (isPromise(foundStream)) {
      // If onFirstData is provided and stream is already open, call it with existingStream flag
      if (payload?.onFirstData) {
        setTimeout(() => payload.onFirstData({ empty: undefined, existingStream: true }), 0)
      }
      return foundStream
    }

    // get all the config needed to perform this action
    const eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on)
    const modifyPayloadFnsMap = getModifyPayloadFnsMap(
      globalConfig.modifyPayloadOn,
      moduleConfig.modifyPayloadOn,
      actionConfig.modifyPayloadOn,
    )
    const modifyReadResponseMap = getModifyReadResponseFnsMap(
      globalConfig.modifyReadResponseOn,
      moduleConfig.modifyReadResponseOn,
      actionConfig.modifyReadResponseOn,
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

    const modifyReadResponseFns: DoOnStreamFns = {
      added: modifyReadResponseMap.added,
      modified: modifyReadResponseMap.modified,
      removed: modifyReadResponseMap.removed,
    }
    const doOnStreamFns: DoOnStreamFns = {
      added: [],
      modified: [],
      removed: [],
    }

    /**
     * Last incoming added/modified docs are cached here temporarily to prevent UI flashing because of the writeLock
     */
    const lastIncomingDocs = new Map<
      string,
      { payload: { [key: string]: unknown } | undefined; meta: DocMetadata }
    >()

    /**
     * this is what must be executed by a plugin store that implemented "stream" functionality
     */
    const mustExecuteOnRead: Required<DoOnStream> = {
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

        return executeOnFns({
          modifyReadResultFns: modifyReadResponseFns.added,
          cacheStoreFns: doOnStreamFns.added,
          payload: result.payload,
          docMetaData: result.meta,
        })
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

        return executeOnFns({
          modifyReadResultFns: modifyReadResponseFns.added,
          cacheStoreFns: doOnStreamFns.added,
          payload: result.payload,
          docMetaData: result.meta,
        })
      },
      removed: async (_payload, _meta) => {
        // check if there's a WriteLock for the document
        const docIdentifier = `${collectionPath}/${_meta.id}`
        // must delete any piled up writeLock docs if by now it's deleted
        lastIncomingDocs.delete(docIdentifier)
        await writeLockPromise(writeLockMap, docIdentifier)

        return executeOnFns({
          modifyReadResultFns: modifyReadResponseFns.removed,
          cacheStoreFns: doOnStreamFns.removed,
          payload: _payload,
          docMetaData: _meta,
        })
      },
    }

    // handle and await each action in sequence
    for (const storeName of storesToExecute) {
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName]?.actions['stream']
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
      cacheStream(() => undefined, null)
    }
    // handle caching the returned promises
    const streamPromises = Object.values(streamInfoPerStore).map((res) => res.streaming)
    // create a single stream promise from multiple stream promises the store plugins return
    const streamPromise = new Promise<void>((resolve, reject) => {
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
