import type { DocMetadata, QueryClause } from '@magnetarjs/types'
import type { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'
import type {
  CollectionReference,
  DocumentSnapshot,
  Firestore,
  Query,
  QueryCompositeFilterConstraint,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  and,
  collection,
  collectionGroup,
  limit,
  or,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore'
import { isArray, isNumber } from 'is-what'

function applyQueryClause(queryClause: QueryClause): QueryCompositeFilterConstraint {
  if ('and' in queryClause) {
    return and(
      ...queryClause.and.map((clause) =>
        isArray(clause) ? where(...clause) : applyQueryClause(clause)
      )
    )
  }
  if ('or' in queryClause) {
    return or(
      ...queryClause.or.map((clause) =>
        isArray(clause) ? where(...clause) : applyQueryClause(clause)
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
    ? collectionGroup(db, collectionPath.split('*/')[1])
    : collection(db, collectionPath)
  for (const queryClause of config.query || []) {
    q = query(q, applyQueryClause(queryClause))
  }
  for (const whereClause of config.where || []) {
    q = query(q, where(...whereClause))
  }
  for (const orderByClause of config.orderBy || []) {
    q = query(q, orderBy(...orderByClause))
  }
  if (config.startAfter) {
    q = query(
      q,
      Array.isArray(config.startAfter)
        ? startAfter(...config.startAfter)
        : startAfter(config.startAfter)
    )
  }
  if (isNumber(config.limit)) {
    q = query(q, limit(config.limit))
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
    exists: docSnapshot.exists(),
  }
  return docMetaData
}
