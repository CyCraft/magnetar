import { firestore } from 'firebase'
import { isNumber } from 'is-what'
import { FirestoreModuleConfig } from 'src/CreatePlugin'
import { DocMetadata } from '@vue-sync/core'

type Firestore = firestore.Firestore
type Query = firestore.Query
type CollectionReference = firestore.CollectionReference
type DocumentSnapshot = firestore.DocumentSnapshot
type QueryDocumentSnapshot = firestore.QueryDocumentSnapshot

export function getQueryInstance (
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

export function docSnapshotToDocMetadata (
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
