import { DocMetadata, isWhereClause, QueryClause } from '@magnetarjs/types'
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
import { isNumber } from 'is-what'

function applyQuery(queryClause: QueryClause): QueryCompositeFilterConstraint {
  if ('and' in queryClause) {
    return and(
      ...queryClause.and.map((whereClauseOrQueryClause) =>
        isWhereClause(whereClauseOrQueryClause)
          ? where(...whereClauseOrQueryClause)
          : applyQuery(whereClauseOrQueryClause)
      )
    )
  }
  // if ('or' in queryClause)
  return or(
    ...queryClause.or.map((whereClauseOrQueryClause) =>
      isWhereClause(whereClauseOrQueryClause)
        ? where(...whereClauseOrQueryClause)
        : applyQuery(whereClauseOrQueryClause)
    )
  )
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
    q = query(q, applyQuery(queryClause))
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
