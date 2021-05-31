import { FirestorePluginOptions } from '../CreatePlugin'
import { Countdown, CountdownInstance } from './Countdown'
// just for types:
import type firebase from 'firebase'
import { isNumber } from 'is-what'

type SetOptions = firebase.firestore.SetOptions
type WriteBatch = firebase.firestore.WriteBatch
type DocumentReference = firebase.firestore.DocumentReference

// https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
// A batched write can contain up to 500 operations.

/**
 * Each write operation in a batch counts towards the 500 limit.
 * Within a write operation, field transforms like serverTimestamp,
 * arrayUnion, and increment each count as an additional operation.
 *
 * @param {Record<string, any>} payload
 * @returns {number}
 */
function countOperations(payload: Record<string, any>): number {
  const count = 1
  // todo: when actions like serverTimestamp, arrayUnion and increment are supported, count them here
  return count
}

export type BatchSync = {
  set: (
    documentPath: string,
    payload: Record<string, any>,
    actionName: 'insert' | 'merge' | 'assign' | 'replace',
    syncDebounceMsOverwrite?: number
  ) => Promise<void>
  update: (
    documentPath: string,
    payload: Record<string, any>,
    syncDebounceMsOverwrite?: number
  ) => Promise<void>
  delete: (documentPath: string, syncDebounceMsOverwrite?: number) => Promise<void>
}

type DebugInfo = {
  [key in 'insert' | 'merge' | 'assign' | 'replace' | 'delete' | 'deleteProp']?:
    | {
        [documentPath in string]: any[]
      }
    | string[]
}

type SyncStack = {
  /**
   * Maximum 500! If < 500 additional operations can be added to this same syncStack.
   */
  operationCount: number
  batch: WriteBatch
  resolves: (() => void)[]
  rejects: ((error: any) => void)[]
  debugInfo: DebugInfo
}

type State = {
  queue: SyncStack[]
  countdown: CountdownInstance | null
}

/**
 * Creates a BatchSync instance that will sync to firestore and automatically debounce
 *
 * @export
 * @returns {BatchSync}
 */
export function batchSyncFactory(
  firestorePluginOptions: Required<FirestorePluginOptions>
): BatchSync {
  const { firebaseInstance, syncDebounceMs, debug } = firestorePluginOptions

  const state: State = {
    queue: [],
    countdown: null,
  }

  const newSyncStack = (): SyncStack => ({
    operationCount: 0,
    batch: firebaseInstance.firestore().batch(),
    resolves: [],
    rejects: [],
    debugInfo: {},
  })

  function prepareSyncStack(operationCount: number): SyncStack {
    if (!state.queue.length) state.queue.push(newSyncStack())
    const [syncStack] = state.queue
    syncStack.operationCount += operationCount
    return syncStack
  }

  function prepareRef(documentPath: string): DocumentReference {
    return firebaseInstance.firestore().doc(documentPath)
  }

  function preparePayload(_payload: Record<string, any>): {
    payload: Record<string, any>
    operationCount: number
  } {
    // todo: properly handle any serverTimestamp, arrayUnion and increment in here
    const payload = _payload
    const operationCount = countOperations(_payload)
    return { payload, operationCount }
  }

  function addToDebugInfo(
    debugInfo: DebugInfo,
    actionName: keyof DebugInfo,
    documentPath: string,
    payload: any
  ) {
    if (actionName === 'delete') {
      if (!(actionName in debugInfo)) debugInfo[actionName] = [] as any
      ;(debugInfo[actionName] as any).push(documentPath as any)
      return
    }
    if (!(actionName in debugInfo)) debugInfo[actionName] = {}
    const actionInfo = debugInfo[actionName] as any
    if (!(documentPath in actionInfo)) actionInfo[documentPath] = []
    actionInfo[documentPath]?.push(payload)
  }

  /**
   * Removes one `syncStack` entry from the `queue` & executes batch.commit() and makes sure to reject or resolve all actions when this promise is resolved
   */
  function executeSync(): void {
    const syncStack = state.queue.shift()
    if (!syncStack || !syncStack.batch) {
      throw new Error('executeSync executed before it was instantiated')
    }

    if (debug) {
      console.log('[magnetar] Syncing to firestore...', syncStack.debugInfo)
    }

    syncStack.batch
      .commit()
      .then(() => syncStack.resolves.forEach((r) => r()))
      .catch((error) => syncStack.rejects.forEach((r) => r(error)))
  }

  /**
   * Sets a new countdown if it doesn't exist yet, and makes sure that the countdown will executeSync
   *
   * @param {number} [syncDebounceMsOverwrite] Pass a number to set the batch sync countdown. If not set, it will use the globally set `syncDebounceMs`.
   * @returns {CountdownInstance}
   */
  function prepareCountdown(syncDebounceMsOverwrite?: number): CountdownInstance {
    if (!state.countdown) {
      const ms = isNumber(syncDebounceMsOverwrite) ? syncDebounceMsOverwrite : syncDebounceMs
      state.countdown = Countdown(ms)
      state.countdown.done.then(() => {
        executeSync()
        state.countdown = null
      })
    }
    return state.countdown
  }

  function triggerSync(syncDebounceMsOverwrite?: number): void {
    const countdown = prepareCountdown(syncDebounceMsOverwrite)
    countdown.restart()
  }

  function set(
    documentPath: string,
    _payload: Record<string, any>,
    actionName: 'insert' | 'merge' | 'assign' | 'replace',
    syncDebounceMsOverwrite?: number
  ): Promise<void> {
    const options: SetOptions =
      actionName === 'merge'
        ? { merge: true }
        : actionName === 'assign'
        ? { mergeFields: Object.keys(_payload) }
        : {} // 'replace' / 'insert'
    const { payload, operationCount } = preparePayload(_payload)
    const { batch, resolves, rejects, debugInfo } = prepareSyncStack(operationCount)

    if (debug) addToDebugInfo(debugInfo, actionName, documentPath, payload)

    const ref = prepareRef(documentPath)
    batch.set(ref, payload, options)
    const promise: Promise<void> = new Promise((resolve, reject) => {
      resolves.push(resolve)
      rejects.push(reject)
    })
    triggerSync(syncDebounceMsOverwrite)
    return promise
  }

  function update(
    documentPath: string,
    _payload: Record<string, any>,
    syncDebounceMsOverwrite?: number
  ): Promise<void> {
    const { payload, operationCount } = preparePayload(_payload)
    const { batch, resolves, rejects, debugInfo } = prepareSyncStack(operationCount)

    if (debug) addToDebugInfo(debugInfo, 'deleteProp', documentPath, payload)

    const ref = prepareRef(documentPath)
    batch.update(ref, payload)
    const promise: Promise<void> = new Promise((resolve, reject) => {
      resolves.push(resolve)
      rejects.push(reject)
    })
    triggerSync(syncDebounceMsOverwrite)
    return promise
  }

  function _delete(documentPath: string, syncDebounceMsOverwrite?: number): Promise<void> {
    const operationCount = 1
    const { batch, resolves, rejects, debugInfo } = prepareSyncStack(operationCount)

    if (debug) addToDebugInfo(debugInfo, 'delete', documentPath, documentPath)

    const ref = prepareRef(documentPath)
    batch.delete(ref)
    const promise: Promise<void> = new Promise((resolve, reject) => {
      resolves.push(resolve)
      rejects.push(reject)
    })
    triggerSync(syncDebounceMsOverwrite)
    return promise
  }

  return { set, update, delete: _delete }
}
