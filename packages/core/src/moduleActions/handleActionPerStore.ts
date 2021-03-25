import { O } from 'ts-toolbelt'
import { isFullString } from 'is-what'
import { handleAction } from './handleAction'
import { getEventNameFnsMap } from '../types/events'
import {
  ActionConfig,
  MagnetarFetchAction,
  MagnetarWriteAction,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
  ActionName,
} from '../types/actions'
import { ActionType, ActionTernary } from '../types/actionsInternal'
import { FetchResponse, isDoOnFetch, isFetchResponse, DoOnFetch } from '../types/plugins'
import { getModifyPayloadFnsMap } from '../types/modifyPayload'
import { OnAddedFn, getModifyReadResponseFnsMap } from '../types/modifyReadResponse'
import { executeOnFns } from '../helpers/executeOnFns'
import { throwIfNoFnsToExecute } from '../helpers/throwFns'
import { ModuleConfig, GlobalConfig } from '../types/config'
import { CollectionInstance } from '../Collection'
import { DocInstance } from '../Doc'
import { CollectionFn, DocFn } from '../Magnetar'
import { getPluginModuleConfig } from '../helpers/moduleHelpers'

export function handleActionPerStore<TActionName extends Exclude<ActionName, 'stream'>>(
  [collectionPath, _docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  actionName: TActionName,
  actionType: ActionType,
  docFn: DocFn, // actions executed on a "doc" will always return `doc()`
  collectionFn?: CollectionFn // actions executed on a "collection" will return `collection()` or `doc()`
): ActionTernary<TActionName>

export function handleActionPerStore(
  [collectionPath, _docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  actionName: Exclude<ActionName, 'stream'>,
  actionType: ActionType,
  docFn: DocFn, // actions executed on a "doc" will always return `doc()`
  collectionFn?: CollectionFn // actions executed on a "collection" will return `collection()` or `doc()`
):
  | MagnetarFetchAction<any>
  | MagnetarWriteAction<any>
  | MagnetarInsertAction<any>
  | MagnetarDeleteAction<any>
  | MagnetarDeletePropAction<any> {
  // returns the action the dev can call with myModule.insert() etc.
  return async function (
    payload?: any,
    actionConfig: ActionConfig = {}
  ): Promise<DocInstance | CollectionInstance> {
    let docId = _docId
    // get all the config needed to perform this action
    const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError
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
    const eventNameFnsMap = getEventNameFnsMap(globalConfig.on, moduleConfig.on, actionConfig.on)
    const storesToExecute: string[] =
      actionConfig.executionOrder ||
      (moduleConfig.executionOrder || {})[actionName] ||
      (moduleConfig.executionOrder || {})[actionType] ||
      (globalConfig.executionOrder || {})[actionName] ||
      (globalConfig.executionOrder || {})[actionType] ||
      []
    throwIfNoFnsToExecute(storesToExecute)
    // update the payload
    for (const modifyFn of modifyPayloadFnsMap[actionName]) {
      payload = modifyFn(payload, docId)
    }

    // create the abort mechanism
    type StopExecution = boolean | 'revert'
    let stopExecution = false as StopExecution
    /**
     * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
     */
    function stopExecutionAfterAction(trueOrRevert: StopExecution = true): void {
      stopExecution = trueOrRevert
    }

    /**
     * each each time a store returns a `FetchResponse` then all `doOnFetchFns` need to be executed
     */
    const doOnFetchFns: DoOnFetch[] = modifyReadResponseMap.added

    // handle and await each action in sequence
    let resultFromPlugin: void | string | FetchResponse | OnAddedFn | any
    for (const [i, storeName] of storesToExecute.entries()) {
      // a previous iteration stopped the execution:
      if (stopExecution === true) break
      // find the action on the plugin
      const pluginAction = globalConfig.stores[storeName].actions[actionName]
      const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName)
      // the plugin action
      resultFromPlugin = !pluginAction
        ? resultFromPlugin
        : await handleAction({
            collectionPath,
            docId,
            pluginModuleConfig,
            pluginAction,
            payload, // should always use the payload as passed originally for clarity
            eventNameFnsMap,
            onError,
            actionName,
            stopExecutionAfterAction,
            storeName,
          })
      // handle reverting. stopExecution might have been modified by `handleAction`
      if (stopExecution === 'revert') {
        const storesToRevert = storesToExecute.slice(0, i)
        storesToRevert.reverse()
        for (const storeToRevert of storesToRevert) {
          const pluginRevertAction = globalConfig.stores[storeToRevert].revert
          const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeToRevert)
          await pluginRevertAction({
            payload,
            collectionPath,
            docId,
            pluginModuleConfig,
            actionName,
            error: resultFromPlugin, // in this case the result is the error
          })
          // revert eventFns, handle and await each eventFn in sequence
          for (const fn of eventNameFnsMap.revert) {
            await fn({
              payload,
              result: resultFromPlugin,
              actionName,
              storeName,
              collectionPath,
              docId,
            })
          }
        }
        // now we must throw the error
        throw resultFromPlugin
      }

      // special handling for 'insert' (resultFromPlugin will always be `string`)
      if (actionName === 'insert' && isFullString(resultFromPlugin)) {
        // update the modulePath if a doc with random ID was inserted in a collection
        // if this is the case the result will be a string - the randomly genererated ID
        if (!docId) {
          docId = resultFromPlugin
        }
      }

      // special handling for 'fetch' (resultFromPlugin will always be `FetchResponse | OnAddedFn`)
      if (actionName === 'fetch') {
        if (isDoOnFetch(resultFromPlugin)) {
          doOnFetchFns.push(resultFromPlugin)
        }
        if (isFetchResponse(resultFromPlugin)) {
          for (const docRetrieved of resultFromPlugin.docs) {
            executeOnFns(doOnFetchFns, docRetrieved.data, [docRetrieved])
          }
        }
      }
    }

    const modulePath = [collectionPath, docId].filter(Boolean).join('/')

    // anything that's executed from a "collection" module:
    // 'insert' always returns a DocInstance, unless the "abort" action was called, then the modulePath might still be a collection:
    if (actionName === 'insert' && docId) {
      // we do not pass the `moduleConfig`, because it's the moduleConfig of the "collection" in this case
      return docFn(modulePath)
    }

    // anything that's executed from a "doc" module:
    if (docId || !collectionFn) return docFn(modulePath, moduleConfig)

    // all other actions triggered on collections ('fetch' is the only possibility left)
    // should return the collection:
    return collectionFn(modulePath, moduleConfig)
  }
}
