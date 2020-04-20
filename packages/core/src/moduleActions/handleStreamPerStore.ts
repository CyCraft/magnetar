import { O } from 'ts-toolbelt'
import { handleStream } from './handleStream'
import { ActionConfig, VueSyncStreamAction } from '../types/actions'
import { ActionType } from '../types/actionsInternal'
import {
  PluginModuleConfig,
  StreamResponse,
  DoOnStreamFns,
  isDoOnStream,
  DoOnStream,
} from '../types/plugins'
import { getEventNameFnsMap } from '../types/events'
import { getModifyPayloadFnsMap } from '../types/modifyPayload'
import { getModifyReadResponseFnsMap } from '../types/modifyReadResponse'
import { executeOnFns } from '../helpers/executeOnFns'
import { throwOnIncompleteStreamResponses, throwIfNoFnsToExecute } from '../helpers/throwFns'
import { ModuleConfig, GlobalConfig } from '../types/config'

export function handleStreamPerStore (
  modulePath: string,
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  actionType: ActionType,
  openStreams: { [identifier: string]: () => void }
): VueSyncStreamAction {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (payload?: any, actionConfig: ActionConfig = {}): Promise<void> {
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
      payload = modifyFn(payload)
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
      const pluginModuleConfig: PluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}

      // the plugin action
      if (pluginAction) {
        const result = await handleStream({
          modulePath,
          pluginAction,
          pluginModuleConfig,
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
            doOnStreamFns[doOn].push(doFn)
          }
        }
        // if the plugin action for stream returns a "stream response" result
        if (!isDoOnStream(result)) {
          streamInfoPerStore[storeName] = result
        }
      }
    }
    throwOnIncompleteStreamResponses(streamInfoPerStore, doOnStreamFns)
    const streamPromises = Object.values(streamInfoPerStore).map(({ streaming }) => streaming)
    // create a function to stop all streams
    const identifier = JSON.stringify(payload)
    openStreams[identifier] = (): void =>
      Object.values(streamInfoPerStore).forEach(({ stop }) => stop())
    // return all the stream promises as one promise
    return new Promise((resolve, reject) => {
      Promise.all(streamPromises)
        // todo: why can I not just write then(resolve)
        .then(() => resolve())
        .catch(reject)
    })
  }
}
