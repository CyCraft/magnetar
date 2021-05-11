import { O } from 'ts-toolbelt'
import { handleStream } from './handleStream'
import {
  ActionConfig,
  MagnetarStreamAction,
  OpenStreams,
  FindStream,
  OpenStreamPromises,
  FindStreamPromise,
} from '../types/actions'
import { ActionType } from '../types/actionsInternal'
import { StreamResponse, DoOnStreamFns, isDoOnStream, DoOnStream } from '../types/plugins'
import { getEventNameFnsMap } from '../types/events'
import { getModifyPayloadFnsMap } from '../types/modifyPayload'
import { getModifyReadResponseFnsMap } from '../types/modifyReadResponse'
import { executeOnFns } from '../helpers/executeOnFns'
import { throwOnIncompleteStreamResponses, throwIfNoFnsToExecute } from '../helpers/throwFns'
import { ModuleConfig, GlobalConfig } from '../types/config'
import { getPluginModuleConfig } from '../helpers/moduleHelpers'
import { isPromise } from 'is-what'

export function handleStreamPerStore(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  actionType: ActionType,
  streamPromiseInfo: {
    openStreams: OpenStreams
    findStream: FindStream
    openStreamPromises: OpenStreamPromises
    findStreamPromise: FindStreamPromise
  }
): MagnetarStreamAction {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (payload?: any, actionConfig: ActionConfig = {}): Promise<void> {
    const { openStreams, openStreamPromises, findStreamPromise } = streamPromiseInfo
    const foundStreamPromise = findStreamPromise(payload)
    if (isPromise(foundStreamPromise)) return foundStreamPromise
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
      added: (_payload, _meta) => executeOnFns(doOnStreamFns.added, _payload, [_meta]),
      modified: (_payload, _meta) => executeOnFns(doOnStreamFns.modified, _payload, [_meta]),
      removed: (_payload, _meta) => executeOnFns(doOnStreamFns.removed, _payload, [_meta]),
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
    // handle saving the returned promises
    const openStreamIdentifier = payload ?? undefined
    const streamPromises = Object.values(streamInfoPerStore).map(({ streaming }) => streaming)
    // create a single stream promise from multiple stream promises the store plugins return
    const streamPromise: Promise<void> = new Promise((resolve, reject) => {
      Promise.all(streamPromises)
        // todo: why can I not just write then(resolve)
        .then(() => resolve())
        .catch(reject)
    })
    // set the streamPromise in the openStreamPromises
    openStreamPromises.set(openStreamIdentifier, streamPromise)
    // create a function to closeStream from the stream of each store
    const closeStream = (): void => {
      Object.values(streamInfoPerStore).forEach(({ stop }) => stop())
      openStreams.delete(openStreamIdentifier)
      openStreamPromises.delete(openStreamIdentifier)
    }
    openStreams.set(openStreamIdentifier, closeStream)
    // return the stream promise
    return streamPromise
  }
}
