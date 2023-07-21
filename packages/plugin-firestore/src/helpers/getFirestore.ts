import { DocMetadata, QueryClause } from '@magnetarjs/types'
import type { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'
import type {
  CollectionReference,
  DocumentSnapshot,
  Firestore,
  Query,
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

function applyQuery(q: CollectionReference | Query, queryClause: QueryClause): Query {
  if ('and' in queryClause) {
    if (isArray(queryClause.and)) {
      return query(q, and(...queryClause.and.map((whereClause) => where(...whereClause))))
    }
    return applyQuery(q, queryClause.and)
  }
  if ('or' in queryClause) {
    if (isArray(queryClause.or)) {
      return query(q, or(...queryClause.or.map((whereClause) => where(...whereClause))))
    }
    return applyQuery(q, queryClause.or)
  }
  return q
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
    q = applyQuery(q, queryClause)
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
