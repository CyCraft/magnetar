import type {
  ActionConfig,
  ActionName,
  ActionTernary,
  CollectionFn,
  DocFn,
  FetchResponse,
  GlobalConfig,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
  MagnetarWriteAction,
  ModuleConfig,
  SyncBatch,
  WriteLock,
} from '@magnetarjs/types'
import { isStoreSplit } from '@magnetarjs/utils'
import { mapGetOrSet } from 'getorset-anything'
import { isFullArray, isFullString, isPlainObject } from 'is-what'
import { mapObject } from 'map-anything'
import { getEventNameFnsMap } from '../helpers/eventHelpers.js'
import { getModifyPayloadFnsMap } from '../helpers/modifyPayload.js'
import { getPluginModuleConfig } from '../helpers/moduleHelpers.js'
import { throwIfNoFnsToExecute } from '../helpers/throwFns.js'
import { handleAction } from './handleAction.js'

export type HandleWritePerStoreParams = {
  collectionPath: string
  _docId: string | undefined
  moduleConfig: ModuleConfig
  globalConfig: Required<GlobalConfig>
  writeLockMap: Map<string, WriteLock>
  docFn: DocFn // actions executed on a "doc" will always return `doc()`
  collectionFn?: CollectionFn // actions executed on a "collection" will return `collection()` or `doc()`
}

export function handleWritePerStore<
  TActionName extends Extract<
    ActionName,
    'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete'
  >,
>(sharedParams: HandleWritePerStoreParams, actionName: TActionName): ActionTernary<TActionName>
export function handleWritePerStore(
  sharedParams: HandleWritePerStoreParams,
  actionName: Extract<
    ActionName,
    'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete'
  >,
):
  | MagnetarWriteAction<any>
  | MagnetarInsertAction<any>
  | MagnetarDeleteAction
  | MagnetarDeletePropAction<any> {
  const { collectionPath, _docId, moduleConfig, globalConfig, writeLockMap, docFn, collectionFn } = sharedParams // prettier-ignore

  // returns the action the dev can call with myModule.insert() etc.
  return function (payload?: any, actionConfig: ActionConfig = {}): Promise<any> {
    // set up and/or reset te writeLock for write actions
    // Always use collection-level write lock
    const writeLockId = collectionPath
    const writeLock = mapGetOrSet(writeLockMap, writeLockId, (): WriteLock => {
      return { promise: null, resolve: () => undefined, countdown: null }
    })

    // we need to create a promise we'll resolve later to prevent any incoming docs from being written to the cache store during this time
    if (writeLock.promise === null) {
      writeLock.promise = new Promise<void>((resolve) => {
        writeLock.resolve = () => {
          resolve()
          writeLock.resolve = () => undefined
          writeLock.promise = null
          if (writeLock.countdown !== null) {
            clearTimeout(writeLock.countdown)
            writeLock.countdown = null
          }
        }
      })
    }
    if (writeLock.promise !== null && writeLock.countdown !== null) {
      // there already is a promise, let's just stop the countdown, we'll start it again at the end of all the store actions
      clearTimeout(writeLock.countdown)
      writeLock.countdown = null
    }

    // eslint-disable-next-line no-async-promise-executor
    const actionPromise = new Promise<any>(async (resolve, reject) => {
      let docId = _docId
      let modulePath = [collectionPath, docId].filter(Boolean).join('/')

      try {
        // get all the config needed to perform this action
        const onError = actionConfig.onError || moduleConfig.onError || globalConfig.onError
        const modifyPayloadFnsMap = getModifyPayloadFnsMap(
          globalConfig.modifyPayloadOn,
          moduleConfig.modifyPayloadOn,
          actionConfig.modifyPayloadOn,
        )
        const eventNameFnsMap = getEventNameFnsMap(
          globalConfig.on,
          moduleConfig.on,
          actionConfig.on,
        )
        const storesToExecute: string[] =
          actionConfig.executionOrder ||
          (moduleConfig.executionOrder || {})[actionName] ||
          (moduleConfig.executionOrder || {})['write'] ||
          (globalConfig.executionOrder || {})[actionName] ||
          (globalConfig.executionOrder || {})['write'] ||
          []
        throwIfNoFnsToExecute(storesToExecute)

        const unwrapStoreSplits = (payloadChunk: any, storeName: string): any => {
          return isStoreSplit(payloadChunk)
            ? payloadChunk.storePayloadDic[storeName]
            : isPlainObject(payloadChunk)
              ? mapObject(payloadChunk, (value) => unwrapStoreSplits(value, storeName))
              : payloadChunk
        }

        let payloadModified = payload
        for (const modifyFn of modifyPayloadFnsMap[actionName]) {
          /** it's important to only execute the hooks once! */
          payloadModified = modifyFn(payloadModified)
        }

        /** Now let's create a separate payload per store */
        const storePayloadDic = storesToExecute.reduce<{
          [key: string]: any
          cache?: any
        }>(
          (dic, storeName) => ({ ...dic, [storeName]: unwrapStoreSplits(payloadModified, storeName) }), // prettier-ignore
          {},
        )

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
         * Fetching on a collection should return a map with just the fetched records for that API call
         */
        const collectionFetchResult = new Map<string, { [key: string]: any }>()

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
        for (const [i, storeName] of storesToExecute.entries()) {
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
                payload: storePayloadDic[storeName], // should always use the payload as passed originally for clarity
                actionConfig,
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
              const pluginRevertAction = globalConfig.stores[storeToRevert]?.revert
              const pluginModuleConfig = getPluginModuleConfig(moduleConfig, storeToRevert)
              if (pluginRevertAction) {
                await pluginRevertAction({
                  payload: storePayloadDic[storeName],
                  actionConfig,
                  collectionPath,
                  docId,
                  pluginModuleConfig,
                  actionName,
                  error: resultFromPlugin, // in this case the result is the error
                })
              }
              // revert eventFns, handle and await each eventFn in sequence
              for (const fn of eventNameFnsMap.revert) {
                await fn({ payload: storePayloadDic[storeName], result: resultFromPlugin, actionName, storeName, collectionPath, docId, path: modulePath, pluginModuleConfig }) // prettier-ignore
              }
            }
            writeLock.resolve()
            // now we must throw the error
            throw resultFromPlugin
          }

          // special handling for 'insert' (resultFromPlugin will always be `string | [string, SyncBatch]`)
          if (actionName === 'insert') {
            // update the modulePath if a doc with random ID was inserted in a collection
            // if this is the case the result will be a string - the randomly genererated ID
            if (!docId) {
              if (isFullString(resultFromPlugin)) {
                docId = resultFromPlugin
              }
              if (isFullArray(resultFromPlugin) && isFullString(resultFromPlugin[0])) {
                docId = resultFromPlugin[0]
              }
              modulePath = [collectionPath, docId].filter(Boolean).join('/')
            }
          }
        }
        // all the stores resolved their actions

        // start the writeLock countdown
        if (!writeLock.countdown) {
          writeLock.countdown = setTimeout(writeLock.resolve, 5000)
        }

        // 'insert' always returns a DocInstance, unless the "abort" action was called, then the modulePath might still be a collection:
        if (actionName === 'insert' && docId) {
          resolve(docFn(modulePath, moduleConfig))
          return
        }

        // anything that's executed from a "doc" module:
        if (docId || !collectionFn) {
          resolve(docFn(modulePath, moduleConfig).data)
          return
        }

        // all other actions triggered on collections ('fetch' is the only possibility left)
        resolve(collectionFetchResult)
      } catch (error) {
        reject(error)
      }
    })

    return actionPromise
  }
}
