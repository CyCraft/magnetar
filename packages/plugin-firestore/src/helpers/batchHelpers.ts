import type { SyncBatch } from '@magnetarjs/types'
import { deleteField, doc, Firestore, WriteBatch, writeBatch } from 'firebase/firestore'

export function createWriteBatch(db: Firestore): WriteBatch {
  return writeBatch(db)
}

/**
 * A function that applies everything in the `SyncBatch` to a Firestore's `WriteBatch`.
 * It mutates the passed `batch`.
 */
export function applySyncBatch(writeBatch: WriteBatch, batch: SyncBatch, db: Firestore): undefined {
  batch.insert.forEach((payload, documentPath) => {
    const ref = doc(db, documentPath)
    writeBatch.set(ref, payload)
  })
  batch.assign.forEach((payload, documentPath) => {
    const ref = doc(db, documentPath)
    writeBatch.set(ref, payload, { mergeFields: Object.keys(payload) })
  })
  batch.merge.forEach((payload, documentPath) => {
    const ref = doc(db, documentPath)
    writeBatch.set(ref, payload, { merge: true })
  })
  batch.replace.forEach((payload, documentPath) => {
    const ref = doc(db, documentPath)
    writeBatch.set(ref, payload)
  })
  batch.deleteProp.forEach((payload, documentPath) => {
    const ref = doc(db, documentPath)
    const _payload = [...payload].reduce(
      (carry, propPath) => ({
        ...carry,
        [propPath]: deleteField(),
      }),
      {} as any
    )
    writeBatch.update(ref, _payload)
  })
  batch.delete.forEach((documentPath) => {
    const ref = doc(db, documentPath)
    writeBatch.delete(ref)
  })
}
