import { isEmptyObject, isNumber } from 'is-what'
import { merge as mergeObjects } from 'merge-anything'
import { removeProp } from 'remove-anything'
import { mapGetOrSet } from 'getorset-anything'
import { logWithFlair } from '@magnetarjs/utils'
import { SyncBatch } from '@magnetarjs/types'
import { Countdown, CountdownInstance } from './Countdown'
import { FirestorePluginOptions, Firestore, ApplySyncBatch, CreateWriteBatch } from './types'

// https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
// A batched write can contain up to 500 operations.

const MAX_OPERATION_COUNT = 500

type Stack = {
  /**
   * Maximum 500! If < 500 additional operations can be added to this same stack.
   */
  operationCount: number
  resolves: (() => void)[]
  rejects: ((error: any) => void)[]
  batch: SyncBatch
}

export type BatchSync = {
  assign: (documentPath: string, payload: Record<string, unknown>, debounceMsOverwrite?: number) => Promise<SyncBatch> // prettier-ignore
  merge: (documentPath: string, payload: Record<string, unknown>, debounceMsOverwrite?: number) => Promise<SyncBatch> // prettier-ignore
  replace: (documentPath: string, payload: Record<string, unknown>, debounceMsOverwrite?: number) => Promise<SyncBatch> // prettier-ignore
  insert: (documentPath: string, payload: Record<string, unknown>, debounceMsOverwrite?: number) => Promise<SyncBatch> // prettier-ignore
  deleteProp: (documentPath: string, payload: string[], debounceMsOverwrite?: number) => Promise<SyncBatch> // prettier-ignore
  delete: (documentPath: string, debounceMsOverwrite?: number) => Promise<SyncBatch>
  forceSyncEarly: () => Promise<void>
}

const newStack = (): Stack => ({
  operationCount: 0,
  resolves: [],
  rejects: [],
  batch: { insert: new Map(), assign: new Map(), merge: new Map(), replace: new Map(), deleteProp: new Map(), delete: new Set() }, // prettier-ignore
})

/**
 * Each write operation in a batch counts towards the 500 limit.
 * Within a write operation, field transforms like serverTimestamp,
 * arrayUnion, and increment each count as an additional operation.
 *
 * @param {Record<string, unknown>} payload
 * @returns {number}
 */
function countOperations(payload: Record<string, unknown>): number {
  const count = 1
  // todo: when actions like serverTimestamp, arrayUnion and increment are supported, count them here
  return count
}

function preparePayload(_payload: Record<string, unknown>): {
  payload: Record<string, unknown>
  operationCount: number
} {
  // todo: properly handle any serverTimestamp, arrayUnion and increment in here
  const payload = _payload
  const operationCount = countOperations(_payload)
  return { payload, operationCount }
}

function prepareReturnPromise(stack: Stack): Promise<SyncBatch> {
  return new Promise((resolve, reject) => {
    stack.resolves.push(() => resolve(stack.batch))
    stack.rejects.push(reject)
  })
}

/**
 * Creates a BatchSync instance that will sync to firestore and automatically debounce
 *
 * @export
 * @returns {BatchSync}
 */
export function batchSyncFactory(
  firestorePluginOptions: Required<FirestorePluginOptions<Firestore>>,
  createWriteBatch: CreateWriteBatch,
  applySyncBatch: ApplySyncBatch
): BatchSync {
  const { db, syncDebounceMs, debug } = firestorePluginOptions
  // const applySyncBatch = applySyncBatchFactory(db, )

  const state: { queue: Stack[]; countdown: CountdownInstance | null } = {
    queue: [],
    countdown: null,
  }

  async function prepareStack(operationCount: number, queueIndex = 0): Promise<Stack> {
    if (!state.queue[queueIndex]) state.queue[queueIndex] = newStack()
    const stack = state.queue[queueIndex]
    if (stack.operationCount + operationCount >= MAX_OPERATION_COUNT) {
      return prepareStack(operationCount, queueIndex + 1)
    }
    stack.operationCount += operationCount
    return stack
  }

  /**
   * Removes one `stack` entry from the `queue` & executes batch.commit() and makes sure to reject or resolve all actions when this promise is resolved
   */
  function executeSync(): void {
    state.countdown = null
    const stack = state.queue.shift()
    if (!stack) {
      throw new Error('executeSync executed before it was instantiated')
    }
    const writeBatch = createWriteBatch(db as any)
    try {
      applySyncBatch(writeBatch as any, stack.batch, db as any)
    } catch (error) {
      stack.rejects.forEach((rej) => rej(error))
      if (state.queue.length) {
        triggerSync(0)
      }
      return
    }

    if (debug) {
      logWithFlair('Syncing to firestore...', stack.batch)
    }

    writeBatch
      .commit()
      .then(() => stack.resolves.forEach((res) => res()))
      .catch((error: unknown) => stack.rejects.forEach((rej) => rej(error)))
      .finally(() => {
        if (state.queue.length) {
          triggerSync(0)
        }
      })
  }

  function forceSyncEarly(): Promise<void> {
    return new Promise((resolve) => {
      // make sure all actions in same cycle are included
      setTimeout(() => {
        if (!state.countdown) return resolve()
        state.countdown.done.then(() => resolve())
        state.countdown.forceFinish()
      }, 0)
    })
  }

  /**
   * Sets a new countdown if it doesn't exist yet, and makes sure that the countdown will executeSync
   *
   * @param {number} [debounceMsOverwrite] Pass a number to set the batch sync countdown. If not set, it will use the globally set `syncDebounceMs`.
   * @returns {CountdownInstance}
   */
  function prepareCountdown(debounceMsOverwrite?: number): CountdownInstance {
    if (!state.countdown) {
      const ms = isNumber(debounceMsOverwrite) ? debounceMsOverwrite : syncDebounceMs
      state.countdown = Countdown(ms)
      state.countdown.done.then(() => executeSync())
    }
    return state.countdown
  }

  function triggerSync(debounceMsOverwrite?: number): void {
    const countdown = prepareCountdown(debounceMsOverwrite)
    countdown.restart(debounceMsOverwrite)
  }

  async function insert(
    documentPath: string,
    _payload: Record<string, unknown>,
    debounceMsOverwrite?: number
  ): Promise<SyncBatch> {
    const { payload, operationCount } = preparePayload(_payload)
    const stack = await prepareStack(operationCount)

    stack.batch.insert.set(documentPath, payload)

    const promise = prepareReturnPromise(stack)
    triggerSync(debounceMsOverwrite)
    return promise
  }

  async function assign(
    documentPath: string,
    _payload: Record<string, unknown>,
    debounceMsOverwrite?: number
  ): Promise<SyncBatch> {
    const { payload, operationCount } = preparePayload(_payload)
    let stack = await prepareStack(operationCount)

    // flush! Because these writes cannot be combined
    if (stack.batch.merge.has(documentPath) || stack.batch.deleteProp.has(documentPath)) {
      await forceSyncEarly()
      stack = await prepareStack(operationCount)
    }

    // when queueing a `replace` we need to update this payload instead
    const replacePayload = stack.batch.replace.get(documentPath)
    if (replacePayload) {
      stack.batch.replace.set(documentPath, { ...replacePayload, ...payload })
    }

    // otherwise combine with any previous payload
    if (!replacePayload) {
      const previousPayload = stack.batch.assign.get(documentPath)
      stack.batch.assign.set(documentPath, { ...previousPayload, ...payload })
    }

    const promise = prepareReturnPromise(stack)
    triggerSync(debounceMsOverwrite)
    return promise
  }

  async function merge(
    documentPath: string,
    _payload: Record<string, unknown>,
    debounceMsOverwrite?: number
  ): Promise<SyncBatch> {
    const { payload, operationCount } = preparePayload(_payload)
    let stack = await prepareStack(operationCount)

    // remove any empty objects as value from the payload
    const payloadSafe = removeProp(payload, {})
    // when there are no changes after removing all empty objects, return early
    if (isEmptyObject(payloadSafe)) {
      const promise = prepareReturnPromise(stack)
      triggerSync(debounceMsOverwrite)
      return promise
    }

    // flush! Because these writes cannot be combined
    if (stack.batch.assign.has(documentPath) || stack.batch.deleteProp.has(documentPath)) {
      await forceSyncEarly()
      stack = await prepareStack(operationCount)
    }

    // when queueing a `replace` we need to update this payload instead
    const replacePayload = stack.batch.replace.get(documentPath)
    if (replacePayload) {
      stack.batch.replace.set(documentPath, mergeObjects(replacePayload, payloadSafe))
    }

    // otherwise combine with any previous payload
    if (!replacePayload) {
      const previousPayload = stack.batch.merge.get(documentPath) || {}
      stack.batch.merge.set(documentPath, mergeObjects(previousPayload, payloadSafe))
    }

    const promise = prepareReturnPromise(stack)
    triggerSync(debounceMsOverwrite)
    return promise
  }

  async function replace(
    documentPath: string,
    _payload: Record<string, unknown>,
    debounceMsOverwrite?: number
  ): Promise<SyncBatch> {
    const { payload, operationCount } = preparePayload(_payload)
    let stack = await prepareStack(operationCount)

    // flush! Because these writes cannot be combined
    if (stack.batch.deleteProp.has(documentPath)) {
      await forceSyncEarly()
      stack = await prepareStack(operationCount)
    }

    stack.batch.replace.set(documentPath, payload)

    const promise = prepareReturnPromise(stack)
    triggerSync(debounceMsOverwrite)
    return promise
  }

  async function deleteProp(
    documentPath: string,
    propPaths: string[],
    debounceMsOverwrite?: number
  ): Promise<SyncBatch> {
    const operationCount = 1
    const stack = await prepareStack(operationCount)

    const map = stack.batch.deleteProp

    const set = mapGetOrSet(map, documentPath, (): Set<string> => new Set())

    propPaths.forEach((p) => set.add(p))

    const promise = prepareReturnPromise(stack)
    triggerSync(debounceMsOverwrite)
    return promise
  }

  async function _delete(documentPath: string, debounceMsOverwrite?: number): Promise<SyncBatch> {
    const operationCount = 1
    let stack = await prepareStack(operationCount)
    const promise = prepareReturnPromise(stack)

    if (stack.batch.insert.has(documentPath)) {
      // flush! Because these writes cannot be combined
      await forceSyncEarly()
      stack = await prepareStack(operationCount)
    }

    // all these changes don't matter anymore, so let's remove them from the stack.batch
    stack.batch.merge.delete(documentPath)
    stack.batch.assign.delete(documentPath)
    stack.batch.replace.delete(documentPath)
    stack.batch.deleteProp.delete(documentPath)

    stack.batch.delete.add(documentPath)

    triggerSync(debounceMsOverwrite)
    return promise
  }

  return { assign, merge, replace, insert, deleteProp, delete: _delete, forceSyncEarly }
}
