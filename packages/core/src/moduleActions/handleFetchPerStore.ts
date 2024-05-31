import type {
  ActionConfig,
  ActionName,
  ActionTernary,
  CollectionFn,
  DocFn,
  DoOnFetch,
  DoOnFetchCount,
  FetchMetaDataCollection,
  FetchPromises,
  FetchResponse,
  GlobalConfig,
  MagnetarFetchAction,
  MagnetarFetchCountAction,
  ModuleConfig,
  OnAddedFn,
  SyncBatch,
  WriteLock,
} from '@magnetarjs/types'
import { isBoolean, isPromise } from 'is-what'
import { getEventNameFnsMap } from '../helpers/eventHelpers.js'
import { executeOnFns } from '../helpers/executeOnFns.js'
import { getModifyPayloadFnsMap } from '../helpers/modifyPayload.js'
import { getModifyReadResponseFnsMap } from '../helpers/modifyReadResponse.js'
import { getPluginModuleConfig } from '../helpers/moduleHelpers.js'
import { getCollectionWriteLocks } from '../helpers/pathHelpers.js'
import {
  isDoOnFetch,
  isDoOnFetchCount,
  isFetchCountResponse,
  isFetchResponse,
} from '../helpers/pluginHelpers.js'
import { throwIfNoFnsToExecute } from '../helpers/throwFns.js'
import { handleAction } from './handleAction.js'

export type HandleFetchPerStoreParams = {
  collectionPath: string
  _docId: string | undefined
  moduleConfig: ModuleConfig
  globalConfig: Required<GlobalConfig>
  fetchPromises: FetchPromises
  writeLockMap: Map<string, WriteLock>
  docFn: DocFn // actions executed on a "doc" will always return `doc()`
  collectionFn?: CollectionFn // actions executed on a "collection" will return `collection()` or `doc()`
  setLastFetched?: (payload: FetchMetaDataCollection) => void
}

export function handleFetchPerStore<
  TActionName extends Extract<ActionName, 'fetch' | 'fetchCount'>,
>(sharedParams: HandleFetchPerStoreParams, actionName: TActionName): ActionTernary<TActionName>
export function handleFetchPerStore(
  sharedParams: HandleFetchPerStoreParams,
  actionName: Extract<ActionName, 'fetch' | 'fetchCount'>
): MagnetarFetchCountAction | MagnetarFetchAction<any> {
  const { collectionPath, _docId, moduleConfig, globalConfig, fetchPromises, writeLockMap, docFn, collectionFn, setLastFetched } = sharedParams // prettier-ignore

  // returns the action the dev can call with myModule.insert() etc.
  return function (payload?: any, actionConfig: ActionConfig = {}): Promise<any> {
    // first of all, check if the same fetch call was just made or not, if so return the same fetch promise early
    const fetchPromiseKey = JSON.stringify(payload)
    const foundFetchPromise = fetchPromises[actionName]?.get(fetchPromiseKey)
    // return the same fetch promise early if it's not yet resolved
    if (actionName === 'fetch' && isPromise(foundFetchPromise)) return foundFetchPromise

    // set up and/or reset te writeLock for write actions
    const writeLockId = _docId ? `${collectionPath}/${_docId}` : collectionPath
    const writeLock = writeLockMap.get(writeLockId)

    // eslint-disable-next-line no-async-promise-executor
    const actionPromise = new Promise<any>(async (resolve, reject) => {
      const docId = _docId
      const modulePath = [collectionPath, docId].filter(Boolean).join('/')
      /**
       * Are we forcing to check in with the DB or can we be satisfied with only optimistic fetch?
       */
      const force = payload?.force === true
      const willForceFetch =
        force || (docId ? docFn(modulePath, moduleConfig).exists !== true : false)
      // we need to await any writeLock _before_ fetching, to prevent grabbing outdated data
      if (actionName === 'fetch' && willForceFetch) {
        await writeLock?.promise
        if (!_docId) {
          // we need to await all promises of all docs in this collection...
          const collectionWriteMaps = getCollectionWriteLocks(collectionPath, writeLockMap)
          await Promise.allSettled(collectionWriteMaps.map((w) => w.promise))
        }
      }

      try {
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
        const eventNameFnsMap = getEventNameFnsMap(
          globalConfig.on,
          moduleConfig.on,
          actionConfig.on
        )
        const storesToExecute: string[] =
          actionConfig.executionOrder ||
          (actionName === 'fetch' ? (moduleConfig.executionOrder || {})[actionName] : false) ||
          (moduleConfig.executionOrder || {})['read'] ||
          (actionName === 'fetch' ? (globalConfig.executionOrder || {})[actionName] : false) ||
          (globalConfig.executionOrder || {})['read'] ||
          []
        throwIfNoFnsToExecute(storesToExecute)
        // update the payload
        if (actionName !== 'fetchCount') {
          for (const modifyFn of modifyPayloadFnsMap[actionName]) {
            payload = modifyFn(payload, docId)
          }
        }

        // create the abort mechanism
        type StopExecution = boolean | 'revert'
        let stopExecution = false as StopExecution
        /**
         * The abort mechanism for the entire store chain. When executed in handleAction() it won't go to the next store in executionOrder.
         */
        function stopExecutionAfterAction(trueOrRevert: StopExecution = true): undefined {
          stopExecution = trueOrRevert
        }

        /**
         * each each time a store returns a `FetchResponse` then it must first go through all on added fns to potentially modify the retuned payload before writing locally
         */
        const doOnAddedFns: OnAddedFn[] = modifyReadResponseMap.added
        /**
         * each each time a store returns a `FetchResponse` then all `doOnFetchFns` need to be executed
         */
        const doOnFetchFns: DoOnFetch[] = []
        /**
         * each each time a store returns a `FetchCountResponse` then all `doOnFetchCount` need to be executed
         */
        const doOnFetchCountFns: DoOnFetchCount[] = []
        /**
         * Fetching on a collection should return a map with just the fetched records for that API call
         */
        const collectionFetchResult = new Map<string, { [key: string]: any }>()
        /**
         * the result of fetchCount
         */
        let fetchCount = NaN

        /**
         * All possible results from the plugins.
         * `unknown` in case an error was thrown
         */
        let resultFromPlugin:
          | undefined
          | string
          | unknown
          | FetchResponse
          | SyncBatch
          | [string, SyncBatch]
        // handle and await each action in sequence
        for (const storeName of storesToExecute.values()) {
          // a previous iteration stopped the execution:
          if (stopExecution === true) break
          // find the action on the plugin
          const pluginAction = globalConfig.stores[storeName]?.actions[actionName]
          const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeName)
          // the plugin action
          resultFromPlugin = !pluginAction
            ? resultFromPlugin
            : await handleAction({
                collectionPath,
                docId,
                modulePath,
                pluginModuleConfig,
                pluginAction,
                payload, // should always use the payload as passed originally for clarity
                actionConfig,
                eventNameFnsMap,
                onError,
                actionName,
                stopExecutionAfterAction,
                storeName,
              })

          // handle reverting. stopExecution might have been modified by `handleAction`
          if (stopExecution === 'revert') {
            // we must update the `exists` prop for fetch calls
            if (actionName === 'fetch' && docId) {
              doOnFetchFns.forEach((fn) => fn(undefined, 'error'))
            }
            // now we must throw the error
            throw resultFromPlugin
          }

          // special handling for 'fetch' (resultFromPlugin will always be `FetchResponse | OnAddedFn`)
          if (actionName === 'fetch') {
            if (isDoOnFetch(resultFromPlugin)) {
              doOnFetchFns.push(resultFromPlugin)
            }
            if (isFetchResponse(resultFromPlugin)) {
              const { docs, reachedEnd, cursor } = resultFromPlugin
              if (isBoolean(reachedEnd)) setLastFetched?.({ reachedEnd, cursor })
              for (const docMetaData of docs) {
                const docResult = executeOnFns({
                  modifyReadResultFns: doOnAddedFns,
                  localStoreFns: doOnFetchFns,
                  payload: docMetaData.data,
                  docMetaData,
                })
                // after doing all `doOnAddedFns` (modifying the read result)
                // and all `doOnFetchFns` (adding it to the local store)
                // we still have a record, so must return it when resolving the fetch action
                if (docResult) collectionFetchResult.set(docMetaData.id, docResult)

                // optimistic fetching can stop the action chain after getting a fetch response for the first time
                const optimisticFetch = !force
                if (optimisticFetch) {
                  stopExecutionAfterAction(true)
                }
              }
            }
          }

          // special handling for 'fetch' (resultFromPlugin will always be `FetchResponse | OnAddedFn`)
          if (actionName === 'fetchCount') {
            if (isDoOnFetchCount(resultFromPlugin)) {
              doOnFetchCountFns.push(resultFromPlugin)
            }
            if (isFetchCountResponse(resultFromPlugin)) {
              for (const doOnFetchCountFn of doOnFetchCountFns) {
                doOnFetchCountFn(resultFromPlugin)
              }
              if (isNaN(fetchCount) || resultFromPlugin.count > fetchCount) {
                fetchCount = resultFromPlugin.count
              }
            }
          }
        }
        // all the stores resolved their actions

        fetchPromises[actionName].delete(fetchPromiseKey)

        if (actionName === 'fetchCount') {
          // return the fetchCount
          resolve(fetchCount)
          return
        }

        // anything that's executed from a "doc" module:
        if (docId || !collectionFn) {
          // return the module's up-to-date data
          resolve(docFn(modulePath, moduleConfig).data)
          return
        }

        // return the collectionFetchResult
        resolve(collectionFetchResult)
      } catch (error) {
        reject(error)
        fetchPromises[actionName].delete(fetchPromiseKey)
      }
    })

    fetchPromises[actionName]?.set(fetchPromiseKey, actionPromise)

    return actionPromise
  }
}
