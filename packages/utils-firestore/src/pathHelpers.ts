import { isCollectionModule } from '@magnetarjs/utils'
import { isFullString } from 'is-what'
import { throwIfInvalidFirestorePath } from './throwFns.js'
import type { Firestore, FirestoreModuleConfig, FirestorePluginOptions } from './types.js'

export function getFirestoreDocPath(
  collectionPath: string,
  docId: string,
  firestoreModuleConfig: FirestoreModuleConfig,
  firestorePluginOptions: FirestorePluginOptions<Firestore>
): string {
  let documentPath: string
  // if firestorePath is set on the module level, always return this
  const { firestorePath } = firestoreModuleConfig
  if (isFullString(firestorePath)) {
    documentPath = isCollectionModule(firestorePath)
      ? [firestorePath, docId].join('/')
      : firestorePath
  } else {
    // else, return the modulePath only if this option is enabled in the global firestorePluginOptions
    const { useModulePathsForFirestore } = firestorePluginOptions
    const modulePath = [collectionPath, docId].join('/')
    documentPath = (useModulePathsForFirestore ? modulePath : firestorePath) as string
  }
  throwIfInvalidFirestorePath(documentPath, 'doc')
  return documentPath
}

export function getFirestoreCollectionPath(
  _collectionPath: string,
  firestoreModuleConfig: FirestoreModuleConfig,
  firestorePluginOptions: FirestorePluginOptions<Firestore>
): string {
  let collectionPath: string
  // if firestorePath is set on the module level, always return this
  const { firestorePath } = firestoreModuleConfig
  if (isFullString(firestorePath)) {
    collectionPath = firestorePath
  } else {
    // else, return the modulePath only if this option is enabled in the global firestorePluginOptions
    const { useModulePathsForFirestore } = firestorePluginOptions
    collectionPath = (useModulePathsForFirestore ? _collectionPath : firestorePath) as string
  }
  throwIfInvalidFirestorePath(collectionPath, 'collection')
  return collectionPath
}
