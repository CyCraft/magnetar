import type { DocMetadata, QueryClause } from '@magnetarjs/types'
import { arrStr, logWithFlair } from '@magnetarjs/utils'
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
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
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

function applyQueryClauseDebug(queryClause: QueryClause): string {
  if ('and' in queryClause) {
    const params = queryClause.and
      .map((clause) =>
        isArray(clause) ? `where(${arrStr(clause)})` : applyQueryClauseDebug(clause)
      )
      .join(', ')
    return `and(${params})`
  }
  if ('or' in queryClause) {
    const params = queryClause.or
      .map((clause) =>
        isArray(clause) ? `where(${arrStr(clause)})` : applyQueryClauseDebug(clause)
      )
      .join(', ')
    return `or(${params})`
  }
  throw new Error('invalid query')
}

/**
 * If the collectionPath includes a `*` it will use a collectionQuery for the part beyond that point
 */
export function getQueryInstance(
  collectionPath: string,
  config: FirestoreModuleConfig,
  db: Firestore,
  debug: boolean
): Query {
  let q: CollectionReference | Query

  let qDebugString: string
  if (debug) {
    ;(window as any).magnetarDebugStartAfter = config.startAfter
  }

  q = collectionPath.includes('*/')
    ? collectionGroup(db, collectionPath.split('*/')[1])
    : collection(db, collectionPath)
  qDebugString = collectionPath.includes('*/')
    ? `collectionGroup(db, "${collectionPath.split('*/')[1]}")`
    : `collection(db, "${collectionPath}")`

  for (const queryClause of config.query || []) {
    q = query(q, applyQueryClause(queryClause))
    qDebugString = `query(${qDebugString}, ${applyQueryClauseDebug(queryClause)})`
  }

  for (const whereClause of config.where || []) {
    q = query(q, where(...whereClause))
    qDebugString = `query(${qDebugString}, where(${arrStr(whereClause)}))`
  }

  for (const orderByClause of config.orderBy || []) {
    q = query(q, orderBy(...orderByClause))
    qDebugString = `query(${qDebugString}, orderBy(${arrStr(orderByClause)}))`
  }

  if (config.startAfter) {
    q = query(
      q,
      Array.isArray(config.startAfter)
        ? startAfter(...config.startAfter)
        : startAfter(config.startAfter)
    )
    qDebugString = `query(${qDebugString}, ${
      Array.isArray(config.startAfter)
        ? `startAfter(${arrStr(config.startAfter)})`
        : `startAfter(window.magnetarDebugStartAfter)`
    })`
  }

  if (isNumber(config.limit)) {
    q = query(q, limit(config.limit))
    qDebugString = `query(${qDebugString}, limit(${config.limit}))`
  }

  if (debug) {
    logWithFlair(`Magnetar's query for Firebase JS SDK:`, qDebugString)
    logWithFlair(
      `execute \`magnetarDebugAddFirebaseToWindow()\` to add these variables to the window, so you can execute the query above: db, getDocs, onSnapshot, getCountFromServer, and, collection, collectionGroup, limit, or, orderBy, query, startAfter, where`
    )
    ;(window as any).magnetarDebugAddFirebaseToWindow = () => {
      ;(window as any).db = db
      ;(window as any).getDocs = getDocs
      ;(window as any).onSnapshot = onSnapshot
      ;(window as any).getCountFromServer = getCountFromServer
      ;(window as any).and = and
      ;(window as any).collection = collection
      ;(window as any).collectionGroup = collectionGroup
      ;(window as any).limit = limit
      ;(window as any).or = or
      ;(window as any).orderBy = orderBy
      ;(window as any).query = query
      ;(window as any).startAfter = startAfter
      ;(window as any).where = where
    }
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
