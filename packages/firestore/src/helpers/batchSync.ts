import { FirestorePluginOptions } from '../CreatePlugin'
import { PlainObject } from '@vue-sync/core'
import { Countdown, CountdownInstance } from './Countdown'

// https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
// A batched write can contain up to 500 operations.

// Eg.
// function pathToRef (firestorePath) {}
// // Get a new write batch
// var batch = db.batch();

// // Set the value of 'NYC'
// var nycRef = db.collection("cities").doc("NYC");
// batch.set(nycRef, {name: "New York City"});

// // Update the population of 'SF'
// var sfRef = db.collection("cities").doc("SF");
// batch.update(sfRef, {"population": 1000000});

// // Delete the city 'LA'
// var laRef = db.collection("cities").doc("LA");
// batch.delete(laRef);

// // Commit the batch
// batch.commit().then(function () {
//     // ...
// });

/**
 * Each write operation in a batch counts towards the 500 limit.
 * Within a write operation, field transforms like serverTimestamp,
 * arrayUnion, and increment each count as an additional operation.
 *
 * @param {PlainObject} payload
 * @returns {number}
 */
function countOperations (payload: PlainObject): number {
  const count = 1
  // todo: when actions like serverTimestamp, arrayUnion and increment are supported, count them here
  return count
}

export type BatchSync = {
  set: (documentPath: string, _payload: PlainObject) => Promise<void>
  delete: (documentPath: string) => Promise<void>
}

type SyncStack = {
  /**
   * Maximum 500! If < 500 additional operations can be added to this same syncStack.
   */
  operationCount: number
  batch: firebase.firestore.WriteBatch
  resolves: (() => void)[]
  rejects: ((error: any) => void)[]
}

type State = {
  queue: SyncStack[]
  countdown: CountdownInstance
}

/**
 * Creates a BatchSync instance that will sync to firestore and automatically debounce
 *
 * @export
 * @returns {BatchSync}
 */
export function batchSyncFactory (
  firestorePluginOptions: Required<FirestorePluginOptions>
): BatchSync {
  const { firestoreInstance, syncDebounceMs } = firestorePluginOptions

  const state: State = {
    queue: [],
    countdown: null,
  }

  const newSyncStack = (): SyncStack => ({
    operationCount: 0,
    batch: firestoreInstance.batch(),
    resolves: [],
    rejects: [],
  })

  function prepareSyncStack (operationCount: number): SyncStack {
    if (!state.queue.length) state.queue.push(newSyncStack())
    const [syncStack] = state.queue
    syncStack.operationCount += operationCount
    return syncStack
  }

  function prepareRef (documentPath: string): firebase.firestore.DocumentReference {
    return firestoreInstance.doc(documentPath)
  }

  function preparePayload (
    _payload: PlainObject
  ): { payload: PlainObject; operationCount: number } {
    // todo: properly handle any serverTimestamp, arrayUnion and increment in here
    const payload = _payload
    const operationCount = countOperations(_payload)
    return { payload, operationCount }
  }

  /**
   * Removes one `syncStack` entry from the `queue` & executes batch.commit() and makes sure to reject or resolve all actions when this promise is resolved
   */
  function executeSync (): void {
    const syncStack = state.queue.shift()
    syncStack.batch
      .commit()
      .then(() => syncStack.resolves.forEach(r => r()))
      .catch(error => syncStack.rejects.forEach(r => r(error)))
  }

  /**
   * Sets a new countdown if it doesn't exist yet, and makes sure that the countdown will executeSync
   *
   * @returns {CountdownInstance}
   */
  function prepareCountdown (): CountdownInstance {
    if (!state.countdown) {
      state.countdown = Countdown(syncDebounceMs)
      state.countdown.done.then(() => {
        executeSync()
        state.countdown = null
      })
    }
    return state.countdown
  }

  function triggerSync (): void {
    const countdown = prepareCountdown()
    countdown.restart()
  }

  function set (documentPath: string, _payload: PlainObject): Promise<void> {
    const { payload, operationCount } = preparePayload(_payload)
    const { batch, resolves, rejects } = prepareSyncStack(operationCount)
    const ref = prepareRef(documentPath)
    batch.set(ref, payload)
    const promise: Promise<void> = new Promise((resolve, reject) => {
      resolves.push(resolve)
      rejects.push(reject)
    })
    triggerSync()
    return promise
  }

  function _delete (documentPath: string): Promise<void> {
    const operationCount = 1
    const { batch, resolves, rejects } = prepareSyncStack(operationCount)
    const ref = prepareRef(documentPath)
    batch.delete(ref)
    const promise: Promise<void> = new Promise((resolve, reject) => {
      resolves.push(resolve)
      rejects.push(reject)
    })
    triggerSync()
    return promise
  }

  return { set, delete: _delete }
}
