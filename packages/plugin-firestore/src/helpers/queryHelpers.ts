import type firebase from 'firebase'
import { isNumber } from 'is-what'
import { FirestoreModuleConfig } from '../CreatePlugin'
import { DocMetadata } from '@magnetarjs/core'

type Query = firebase.firestore.Query
type CollectionReference = firebase.firestore.CollectionReference
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot
type Firestore = firebase.firestore.Firestore

export function getQueryInstance(
  collectionPath: string,
  pluginModuleConfig: FirestoreModuleConfig,
  firestoreInstance: Firestore
): Query {
  const { where = [], orderBy = [], limit } = pluginModuleConfig
  let query: CollectionReference | Query
  query = firestoreInstance.collection(collectionPath)
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
    data: (docSnapshot.data() ?? {}) as any,
    metadata: docSnapshot as any,
    id: docSnapshot.id,
    exists: docSnapshot.exists,
  }
  return docMetaData
}
