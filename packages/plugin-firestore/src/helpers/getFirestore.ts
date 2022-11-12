import type {
  Firestore,
  Query,
  CollectionReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { isNumber } from 'is-what'
import type { FirestoreModuleConfig } from '@magnetarjs/utils-firestore'
import { DocMetadata } from '@magnetarjs/types'

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
