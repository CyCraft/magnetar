import type { DocMetadata, QueryClause } from '@magnetarjs/types'
import type { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'
import type {
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  Query,
  QueryDocumentSnapshot,
  WriteBatch,
} from 'firebase-admin/firestore'
import { FieldValue, Filter } from 'firebase-admin/firestore'
import { isArray, isNumber } from 'is-what'
export type {
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  QueryDocumentSnapshot,
  WriteBatch,
} from 'firebase-admin/firestore'

export function doc(db: Firestore, path: string): DocumentReference<Record<string, unknown>> {
  return db.doc(path)
}

export function createWriteBatch(db: Firestore): WriteBatch {
  return db.batch()
}

export function deleteField(): FieldValue {
  return FieldValue.delete()
}

function queryToFilter(
  queryClause: QueryClause
): ReturnType<(typeof Filter)['or']> | ReturnType<(typeof Filter)['and']> {
  if ('and' in queryClause) {
    return Filter.and(
      ...queryClause.and.map((clause) =>
        isArray(clause) ? Filter.where(...clause) : queryToFilter(clause)
      )
    )
  }
  if ('or' in queryClause) {
    return Filter.or(
      ...queryClause.or.map((clause) =>
        isArray(clause) ? Filter.where(...clause) : queryToFilter(clause)
      )
    )
  }
  throw new Error('invalid query')
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
  for (const queryClause of config.query || []) {
    q = q.where(queryToFilter(queryClause))
  }
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
