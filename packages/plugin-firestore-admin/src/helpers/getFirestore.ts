import type {
  Firestore,
  Query,
  CollectionReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  DocumentReference,
  WriteBatch,
} from 'firebase-admin/firestore'
export type {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  Firestore,
  WriteBatch,
} from 'firebase-admin/firestore'
import { isNumber } from 'is-what'
import type { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'
import type { DocMetadata } from '@magnetarjs/types'
import { FieldValue } from 'firebase-admin/firestore'

export function doc(db: Firestore, path: string): DocumentReference<Record<string, unknown>> {
  return db.doc(path)
}

export function createWriteBatch(db: Firestore): WriteBatch {
  return db.batch()
}

export function deleteField(): FieldValue {
  return FieldValue.delete()
}

/**
 * If the collectionPath includes a `*` it will use a collectionQuery for the part beyond that point
 */
export function getQueryInstance(
  collectionPath: string,
  config: FirestoreModuleConfig,
  db: Firestore
): Query {
  let q: CollectionReference | Query
  q = collectionPath.includes('*/')
    ? db.collectionGroup(collectionPath.split('*/')[1])
    : db.collection(collectionPath)
  for (const whereClause of config.where || []) {
    q = q.where(...whereClause)
  }
  for (const orderByClause of config.orderBy || []) {
    q = q.orderBy(...orderByClause)
  }
  if (config.startAfter) {
    q = Array.isArray(config.startAfter)
      ? q.startAfter(...config.startAfter)
      : q.startAfter(config.startAfter)
  }
  if (isNumber(config.limit)) {
    q = q.limit(config.limit)
  }
  return q
}

export function docSnapshotToDocMetadata(
  docSnapshot:
    | DocumentSnapshot<Record<string, unknown>>
    | QueryDocumentSnapshot<Record<string, unknown>>
): DocMetadata {
  const docMetaData: DocMetadata = {
    data: docSnapshot.data(),
    metadata: docSnapshot as any,
    id: docSnapshot.id,
    exists: docSnapshot.exists,
  }
  return docMetaData
}
