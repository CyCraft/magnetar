import type { SyncBatch } from '@magnetarjs/types'
import { FieldValue, Firestore, WriteBatch } from 'firebase-admin/firestore'

function deleteField(): FieldValue {
  return FieldValue.delete()
}

export function createWriteBatch(db: Firestore): WriteBatch {
  return db.batch()
}

/**
 * A function that applies everything in the `SyncBatch` to a Firestore's `WriteBatch`.
 * It mutates the passed `batch`.
 */
export function applySyncBatch(writeBatch: WriteBatch, batch: SyncBatch, db: Firestore): void {
  batch.insert.forEach((payload, documentPath) => {
    const ref = db.doc(documentPath)
    writeBatch.set(ref, payload)
  })
  batch.assign.forEach((payload, documentPath) => {
    const ref = db.doc(documentPath)
    writeBatch.set(ref, payload, { mergeFields: Object.keys(payload) })
  })
  batch.merge.forEach((payload, documentPath) => {
    const ref = db.doc(documentPath)
    writeBatch.set(ref, payload, { merge: true })
  })
  batch.replace.forEach((payload, documentPath) => {
    const ref = db.doc(documentPath)
    writeBatch.set(ref, payload)
  })
  batch.deleteProp.forEach((payload, documentPath) => {
    const ref = db.doc(documentPath)
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
    const ref = db.doc(documentPath)
    writeBatch.delete(ref)
  })
}
