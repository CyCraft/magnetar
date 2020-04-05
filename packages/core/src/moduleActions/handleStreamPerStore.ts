import { O } from 'ts-toolbelt'
import { VueSyncConfig } from '..'
import { ModuleConfig } from '../CreateModule'
import { handleStream } from './handleStream'
import { ActionType, ActionConfig, VueSyncStreamAction } from '../types/actions'
import {
  PluginModuleConfig,
  StreamResponse,
  DoOnReadFns,
  isDoOnRead,
  DoOnRead,
} from '../types/plugins'
import { getEventNameFnsMap } from '../types/events'
import { getModifyPayloadFnsMap } from '../types/modifyPayload'
import { getModifyReadResponseFnsMap } from '../types/modifyReadResponse'
import { executeOnFns } from '../helpers/executeOnFns'
import { throwOnIncompleteStreamResponses, throwIfNoFnsToExecute } from '../helpers/throwFns'

export function handleStreamPerStore (
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<VueSyncConfig>,
  actionType: ActionType,
  openStreams: { [identifier: string]: () => void }
): VueSyncStreamAction {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (payload?: void | object, actionConfig: ActionConfig = {}): Promise<void> {
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

    const streamInfoPerStore: {
      [storeName: string]: StreamResponse
    } = {}

    const doOnReadFns: DoOnReadFns = {
      added: modifyReadResponseMap.added,
      modified: modifyReadResponseMap.modified,
      removed: modifyReadResponseMap.removed,
    }
    /**
     * this is what must be executed by a plugin store that implemented "stream" functionality
     */
    const mustExecuteOnRead: O.Compulsory<DoOnRead> = {
      added: (_payload, _meta) => executeOnFns(doOnReadFns.added, _payload, [_meta]),
      modified: (_payload, _meta) => executeOnFns(doOnReadFns.modified, _payload, [_meta]),
      removed: (_payload, _meta) => executeOnFns(doOnReadFns.removed, _payload, [_meta]),
    }

    // handle and await each action in sequence
    for (const storeName of storesToExecute) {
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName].actions['stream']
      const pluginModuleConfig: PluginModuleConfig = moduleConfig?.configPerStore[storeName] || {}
      // update the payload
      for (const modifyFn of modifyPayloadFnsMap['stream']) {
        payload = modifyFn(payload, { storeName })
      }
      // the plugin action
      if (pluginAction) {
        const result = await handleStream({
          pluginAction,
          pluginModuleConfig,
          payload, // should always use the payload as passed originally for clarity
          eventNameFnsMap,
          actionName: 'stream',
          storeName,
          mustExecuteOnRead,
        })
        // if the plugin action for stream returns a "do on read" result
        if (isDoOnRead(result)) {
          // register the functions we received: result
          for (const [doOn, doFn] of Object.entries(result)) {
            doOnReadFns[doOn].push(doFn)
          }
        }
        // if the plugin action for stream returns a "stream response" result
        if (!isDoOnRead(result)) {
          streamInfoPerStore[storeName] = result
        }
      }
    }
    throwOnIncompleteStreamResponses(streamInfoPerStore, doOnReadFns)
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
