// import type firebase from 'firebase'
import { isNumber } from 'is-what'
import { FirestoreModuleConfig } from '../CreatePlugin'
import { DocMetadata } from '@magnetarjs/core'

// TODO: update to v9 modular
// type Query = firebase.firestore.Query
// type CollectionReference = firebase.firestore.CollectionReference
// type DocumentSnapshot = firebase.firestore.DocumentSnapshot
// type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot
// type Firestore = firebase.firestore.Firestore
type Query = any
type CollectionReference = any
type DocumentSnapshot = any
type QueryDocumentSnapshot = any
type Firestore = any

export function getQueryInstance(
  collectionPath: string,
  pluginModuleConfig: FirestoreModuleConfig,
  firestore: Firestore
): Query {
  const { where = [], orderBy = [], limit } = pluginModuleConfig
  let query: CollectionReference | Query
  query = firestore.collection(collectionPath)
  for (const whereClause of where) {
    query = query.where(...whereClause)
  }
  for (const orderByClause of orderBy) {
    query = query.orderBy(...orderByClause)
  }
  if (isNumber(limit)) {
    query = query.limit(limit)
  }
  return query
}

export function docSnapshotToDocMetadata(
  docSnapshot: DocumentSnapshot | QueryDocumentSnapshot
): DocMetadata {
  const docMetaData: DocMetadata = {
    data: docSnapshot.data() as Record<string, any> | undefined,
    metadata: docSnapshot as any,
    id: docSnapshot.id,
    exists: docSnapshot.exists,
  }
  return docMetaData
}
